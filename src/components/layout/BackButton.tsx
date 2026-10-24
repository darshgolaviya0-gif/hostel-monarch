import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * A universal "Back" control used across the public site and the
 * authenticated app. Prefers real browser history (so it behaves like the
 * browser's own back button) and falls back to a sensible default route
 * when there's nowhere to go back to (e.g. user landed directly on a deep
 * link or opened the page in a new tab).
 */
export function BackButton({
  fallback = '/',
  label = 'Back',
  className,
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    const historyState = window.history.state as { idx?: number } | null;
    if (historyState && typeof historyState.idx === 'number' && historyState.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-800',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}
