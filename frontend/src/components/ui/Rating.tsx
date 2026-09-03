'use client';

import { useId } from 'react';

export function Rating({ value, max = 5 }: { value: number, max?: number }) {
  const id = useId();
  return (
    <div className="flex">
      {[...Array(max)].map((_, i) => {
        const fillPercentage = Math.min(Math.max(value - i, 0), 1) * 100;
        const gradientId = `star-grad-${id}-${i}`;
        return (
          <svg key={i} className="w-5 h-5 transition-transform hover:-translate-y-0.5 duration-300" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset={`${fillPercentage}%`} stopColor="currentColor" className="text-amber-400" />
                <stop offset={`${fillPercentage}%`} stopColor="currentColor" className="text-slate-200" />
              </linearGradient>
            </defs>
            <path fill={`url(#${gradientId})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}
