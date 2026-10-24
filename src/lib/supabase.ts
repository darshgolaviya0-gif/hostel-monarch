import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Hostel Monarch runs in two modes:
 *  - DEMO MODE (default): no Supabase credentials configured. Everything is
 *    simulated in-memory using src/data/*.ts mock data. This is what ships
 *    out of the box so the product can be explored instantly.
 *  - LIVE MODE: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set (see
 *    .env.example). Real signup/login, admin-approved accounts and a real
 *    Postgres database are used instead.
 */
export const isLiveMode = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isLiveMode
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
