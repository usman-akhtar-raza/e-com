
import { cx } from '@/lib/utils';

export function Badge({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'blue' | 'green' | 'red' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span className={cx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colors[variant])}>
      {children}
    </span>
  );
}
