'use client';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <LoadingSpinner />;

  const navItems = [
    { name: 'Dashboard', href: '/account' },
    { name: 'Orders', href: '/account/orders' },
    { name: 'Profile', href: '/account/profile' },
    { name: 'Wishlist', href: '/account/wishlist' },
    { name: 'Addresses', href: '/account/addresses' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-2 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-1'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
