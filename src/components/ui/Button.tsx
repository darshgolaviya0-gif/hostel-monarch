import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-sm shadow-navy-900/10',
  secondary: 'bg-navy-50 text-navy-800 hover:bg-navy-100',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  gold: 'bg-gold-400 text-navy-950 hover:bg-gold-500 shadow-sm shadow-gold-500/20',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-base px-6 py-3 gap-2 rounded-xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, fullWidth, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
