import React from 'react';
import { cx } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{icon}</div>}
          <input
            ref={ref}
            className={cx(
              "block w-full rounded-xl border border-slate-200 bg-slate-50/50 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:text-sm py-2.5 px-3 outline-none transition-all duration-200",
              icon ? "pl-10" : undefined,
              error && "border-rose-300 bg-rose-50/30 text-rose-700 focus:border-rose-500 focus:ring-rose-500/30",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
