'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ArrowUpRightIcon,
  BagIcon,
  CloseIcon,
  GridIcon,
  HeartIcon,
  MenuIcon,
  PackageIcon,
  SlidersIcon,
  SparkIcon,
  StoreIcon,
  TagIcon,
} from '@/components/ui/Icons';

const navItems = [
  { name: 'Overview', href: '/admin', icon: GridIcon },
  { name: 'Products', href: '/admin/products', icon: PackageIcon },
  { name: 'Categories', href: '/admin/categories', icon: GridIcon },
  { name: 'Brands', href: '/admin/brands', icon: SparkIcon },
  { name: 'Orders', href: '/admin/orders', icon: BagIcon },
  { name: 'Inventory', href: '/admin/inventory', icon: SlidersIcon },
  { name: 'Coupons', href: '/admin/coupons', icon: TagIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: HeartIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/');
  }, [loading, router, user]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="grid min-h-screen place-items-center bg-[#efede7]"><LoadingSpinner /></div>;
  }

  const currentPage = navItems.find((item) => item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))?.name || 'Workspace';

  return (
    <div className="admin-shell flex min-h-screen bg-[#efede7] text-[#11120f]">
      {mobileMenuOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm md:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col border-r border-white/10 bg-[#11120f] text-white transition-transform duration-300 ease-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[92px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#b69b63]/55 bg-[#b69b63]/10 font-display text-xl font-bold italic text-[#d8c28f]">S</span>
            <span><strong className="block text-sm tracking-[0.08em]">SHOPHUB</strong><small className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Commerce studio</small></span>
          </Link>
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 md:hidden" aria-label="Close menu"><CloseIcon className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#b69b63]">Workspace</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-semibold transition-all duration-200 ${active ? 'bg-[#b69b63] text-[#11120f] shadow-[0_12px_30px_rgba(182,155,99,0.16)]' : 'text-white/48 hover:bg-white/[0.06] hover:text-white'}`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? 'text-[#11120f]' : 'text-white/38 group-hover:text-[#cdb785]'}`} />
                  <span className="flex-1">{item.name}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[#11120f]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <Link href="/" className="mb-3 flex items-center justify-between rounded-xl border border-white/10 px-3.5 py-3 text-xs font-semibold text-white/55 transition hover:border-[#b69b63]/45 hover:text-[#d8c28f]">
            <span className="flex items-center gap-2.5"><StoreIcon className="h-4 w-4" /> View storefront</span><ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.045] p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e5dc] text-xs font-black text-[#11120f]">{user.firstName[0]}</span>
            <div className="min-w-0"><p className="truncate text-xs font-bold">{user.firstName} {user.lastName}</p><p className="mt-0.5 truncate text-[10px] text-white/35">Administrator</p></div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-black/10 bg-[#f7f5ef]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white md:hidden" aria-label="Open admin navigation"><MenuIcon className="h-5 w-5" /></button>
            <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8c7340]">Admin portal</p><p className="mt-0.5 text-sm font-bold">{currentPage}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-[#77786f] sm:block">Live workspace</span>
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-45" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" /></span>
          </div>
        </header>

        <main className="admin-content p-4 sm:p-7 lg:p-10 xl:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
