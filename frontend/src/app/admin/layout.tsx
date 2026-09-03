
'use client';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-gray-900 text-white min-h-screen p-4 flex-shrink-0">
        <div className="font-bold text-2xl mb-8 mt-4 text-center text-blue-400">Admin Panel</div>
        <nav className="space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Dashboard</Link>
          <Link href="/admin/products" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Products</Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Orders</Link>
          <Link href="/admin/categories" className="block px-4 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white">Categories</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
