import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Role, Session, User } from '../types';
import { DEMO_USERS } from '../data/users';
import { supabase, isLiveMode } from '../lib/supabase';

const SESSION_KEY = 'hm_session_v1';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minute demo session

interface LoginResult {
  success: boolean;
  error?: string;
  /** Present in live mode when credentials are correct but the account isn't approved yet. */
  accountStatus?: 'pending' | 'rejected' | 'suspended';
}

export interface SignUpPayload {
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  /** Extra role-specific details, e.g. { course, year } for students or { designation } for staff. */
  meta?: Record<string, unknown>;
}

interface SignUpResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  authMode: 'demo' | 'live';
  /** Non-null only in live mode when a real account exists but isn't fully approved yet. */
  accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended' | null;
  login: (role: Role, identifier: string, password: string, remember: boolean) => Promise<LoginResult>;
  loginWithDemo: (role: Role) => Promise<LoginResult>;
  signUp: (payload: SignUpPayload) => Promise<SignUpResult>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  dismissExpiry: () => void;
  extendSession: () => void;
  /** Saves a new profile photo (as a data URL) for the current user. Persists in live mode, in-memory in demo mode. */
  updateAvatar: (dataUrl: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadDemoSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: Session = JSON.parse(raw);
    if (parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  meta: Record<string, unknown> | null;
}

function mapProfileToUser(profile: ProfileRow): User {
  const meta = profile.meta ?? {};
  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    username: profile.email,
    role: profile.role,
    avatar: typeof meta.avatar === 'string' && meta.avatar ? meta.avatar : `https://i.pravatar.cc/150?u=${profile.id}`,
    phone: profile.phone ?? '',
    designation: typeof meta.designation === 'string' ? meta.designation : undefined,
    studentId: typeof meta.studentId === 'string' ? meta.studentId : undefined,
    status: profile.status,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ---------------------------------------------------------------------
  // DEMO MODE STATE
  // ---------------------------------------------------------------------
  const [demoSession, setDemoSession] = useState<Session | null>(() => (isLiveMode ? null : loadDemoSession()));
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (isLiveMode || !demoSession) return;
    const remaining = demoSession.expiresAt - Date.now();
    if (remaining <= 0) {
      setDemoSession(null);
      setSessionExpired(true);
      return;
    }
    const t = setTimeout(() => {
      setDemoSession(null);
      setSessionExpired(true);
    }, remaining);
    return () => clearTimeout(t);
  }, [demoSession]);

  const persistDemo = (s: Session, remember: boolean) => {
    const raw = JSON.stringify(s);
    if (remember) localStorage.setItem(SESSION_KEY, raw);
    else sessionStorage.setItem(SESSION_KEY, raw);
  };

  // ---------------------------------------------------------------------
  // LIVE MODE STATE (Supabase)
  // ---------------------------------------------------------------------
  const [liveSession, setLiveSession] = useState<Session | null>(null);
  const [liveLoaded, setLiveLoaded] = useState(!isLiveMode);

  const fetchProfileAndBuildSession = useCallback(async (userId: string, accessToken: string, expiresAt?: number) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) return null;
    const user = mapProfileToUser(data as ProfileRow);
    const session: Session = {
      user,
      token: accessToken,
      issuedAt: Date.now(),
      expiresAt: expiresAt ? expiresAt * 1000 : Date.now() + SESSION_TTL_MS,
    };
    return session;
  }, []);

  useEffect(() => {
    if (!isLiveMode || !supabase) return;
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session) {
        const s = await fetchProfileAndBuildSession(data.session.user.id, data.session.access_token, data.session.expires_at);
        if (!cancelled) setLiveSession(s);
      }
      if (!cancelled) setLiveLoaded(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!newSession) {
        setLiveSession(null);
        return;
      }
      const s = await fetchProfileAndBuildSession(newSession.user.id, newSession.access_token, newSession.expires_at);
      setLiveSession(s);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [fetchProfileAndBuildSession]);

  // ---------------------------------------------------------------------
  // UNIFIED API
  // ---------------------------------------------------------------------
  const session = isLiveMode ? liveSession : demoSession;
  const accountStatus = isLiveMode && session ? session.user.status ?? null : null;

  const login = useCallback(async (role: Role, identifier: string, password: string, remember: boolean): Promise<LoginResult> => {
    if (isLiveMode && supabase) {
      const email = identifier.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return { success: false, error: 'Please sign in with the email address you registered with.' };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return { success: false, error: error?.message ?? 'Invalid email or password.' };
      }
      const s = await fetchProfileAndBuildSession(data.session.user.id, data.session.access_token, data.session.expires_at);
      if (!s) {
        await supabase.auth.signOut();
        return { success: false, error: 'We could not find a profile for this account. Please contact an administrator.' };
      }
      if (s.user.role !== role) {
        await supabase.auth.signOut();
        return { success: false, error: `This account is registered as "${s.user.role}". Please select that role to sign in.` };
      }
      setLiveSession(s);
      if (s.user.status && s.user.status !== 'approved') {
        return { success: true, accountStatus: s.user.status };
      }
      return { success: true };
    }

    // ---- demo mode ----
    await new Promise((r) => setTimeout(r, 900)); // simulate network latency
    const demoUser = DEMO_USERS[role];
    const idMatch =
      identifier.trim().toLowerCase() === demoUser.email.toLowerCase() ||
      identifier.trim().toLowerCase() === demoUser.username.toLowerCase();
    if (!idMatch) {
      return { success: false, error: `No ${role} account found for "${identifier}". Try the demo credentials shown below.` };
    }
    if (password !== demoUser.password) {
      return { success: false, error: 'Incorrect password. Please try again or use the demo account.' };
    }
    const { password: _pw, ...user } = demoUser;
    const newSession: Session = { user, token: `hm_demo_token_${Date.now()}`, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_TTL_MS };
    persistDemo(newSession, remember);
    setDemoSession(newSession);
    setSessionExpired(false);
    return { success: true };
  }, [fetchProfileAndBuildSession]);

  const loginWithDemo = useCallback(async (role: Role): Promise<LoginResult> => {
    if (isLiveMode) {
      return { success: false, error: 'Demo accounts are only available in demo mode. Please create a real account instead.' };
    }
    const demoUser = DEMO_USERS[role];
    return login(role, demoUser.email, demoUser.password, true);
  }, [login]);

  const signUp = useCallback(async (payload: SignUpPayload): Promise<SignUpResult> => {
    if (!isLiveMode || !supabase) {
      return { success: false, error: 'Account creation is only available in live mode. See .env.example to connect a Supabase project.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone: payload.phone,
          role: payload.role,
          meta: payload.meta ?? {},
        },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true, needsEmailConfirmation: !data.session };
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isLiveMode || !supabase) {
      // Demo mode: simulate.
      await new Promise((r) => setTimeout(r, 900));
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    if (isLiveMode && supabase) {
      supabase.auth.signOut();
      setLiveSession(null);
      return;
    }
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setDemoSession(null);
  }, []);

  const updateAvatar = useCallback(async (dataUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (isLiveMode && supabase) {
      if (!liveSession) return { success: false, error: 'Not signed in.' };
      const userId = liveSession.user.id;
      const { data: row, error: fetchError } = await supabase.from('profiles').select('meta').eq('id', userId).single();
      if (fetchError) return { success: false, error: fetchError.message };
      const newMeta = { ...((row?.meta as Record<string, unknown>) ?? {}), avatar: dataUrl };
      const { error } = await supabase.from('profiles').update({ meta: newMeta }).eq('id', userId);
      if (error) return { success: false, error: error.message };
      setLiveSession((prev) => (prev ? { ...prev, user: { ...prev.user, avatar: dataUrl } } : prev));
      return { success: true };
    }
    // ---- demo mode: in-memory + persisted session only ----
    setDemoSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, user: { ...prev.user, avatar: dataUrl } };
      const remembered = !!localStorage.getItem(SESSION_KEY);
      persistDemo(updated, remembered);
      return updated;
    });
    return { success: true };
  }, [liveSession]);

  const dismissExpiry = useCallback(() => setSessionExpired(false), []);

  const extendSession = useCallback(() => {
    if (isLiveMode) return; // Supabase handles token refresh itself.
    setDemoSession((prev) => {
      if (!prev) return prev;
      const extended = { ...prev, expiresAt: Date.now() + SESSION_TTL_MS };
      persistDemo(extended, true);
      return extended;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session && (!isLiveMode || session.user.status === 'approved'),
      sessionExpired,
      authMode: isLiveMode ? 'live' : 'demo',
      accountStatus: accountStatus as AuthContextValue['accountStatus'],
      login,
      loginWithDemo,
      signUp,
      requestPasswordReset,
      logout,
      dismissExpiry,
      extendSession,
      updateAvatar,
    }),
    [session, sessionExpired, accountStatus, login, loginWithDemo, signUp, requestPasswordReset, logout, dismissExpiry, extendSession, updateAvatar]
  );

  if (isLiveMode && !liveLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
