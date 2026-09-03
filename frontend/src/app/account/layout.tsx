
'use client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <Link href="/account" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">Dashboard</Link>
            <Link href="/account/orders" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">Orders</Link>
            <Link href="/account/profile" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">Profile</Link>
          </nav>
        </aside>
        <main className="flex-1 bg-white border rounded-lg p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
