'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full mx-auto text-center space-y-8 animate-slide-up bg-white/80 backdrop-blur-xl border border-rose-100 rounded-3xl p-10 shadow-xl shadow-rose-900/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-rose-600"></div>

        <div className="w-24 h-24 mx-auto bg-rose-50 rounded-full flex items-center justify-center text-5xl mb-2 shadow-inner border border-rose-100">
          ⚠️
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Something went wrong</h1>
          <p className="text-slate-500 text-base max-w-md mx-auto font-medium leading-relaxed">
            An unhandled error occurred while loading this page. Our team has been notified.
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => reset()}
            className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-rose-500/25 active:scale-95 transition-all font-bold px-8 py-3"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all font-bold px-8 py-3"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
