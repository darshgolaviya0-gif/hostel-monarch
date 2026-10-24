import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in',
          sizeClasses
        )}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4 rounded-t-2xl">
            <div>
              <h3 className="font-display text-lg font-bold text-navy-950">{title}</h3>
              {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'primary',
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60',
            tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-navy-800 hover:bg-navy-900'
          )}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
