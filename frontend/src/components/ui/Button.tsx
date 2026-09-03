
import React from 'react';
import { cx } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', isLoading, className, children, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={cx(base, variants[variant], sizes[size], isLoading && "opacity-75 cursor-not-allowed", className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="mr-2 border-2 border-current border-t-transparent rounded-full w-4 h-4 animate-spin"></span> : null}
      {children}
    </button>
  );
}
