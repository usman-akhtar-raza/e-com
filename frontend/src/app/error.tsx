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
    <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="text-5xl font-extrabold text-red-500">⚠️</div>
      <h1 className="text-3xl font-extrabold text-gray-900">Something went wrong</h1>
      <p className="text-gray-500 max-w-md mx-auto">
        An unhandled error occurred while loading this page. Our team has been notified.
      </p>
      <div className="pt-4 flex justify-center space-x-4">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>Go Home</Button>
      </div>
    </div>
  );
}
