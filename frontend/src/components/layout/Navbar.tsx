'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from '@/components/ui/Icons';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;

    api.cart.get()
      .then((cart) => setCartCount(cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0))
      .catch(() => setCartCount(0));
    api.wishlist.get()
      .then((items) => setWishlistCount(items?.length || 0))
      .catch(() => setWishlistCount(0));
  }, [user, pathname]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  }

  const navLinks = [
    { name: 'New in', href: '/products' },
    { name: 'Collections', href: '/categories' },
    { name: 'Best sellers', href: '/products?sortBy=createdAt&sortOrder=DESC' },
  ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#11120f] px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#f4f1ea] sm:text-[11px]">
        Complimentary delivery on orders over $100 <span className="mx-2 text-[#b69b63]">•</span> Easy 30-day returns
      </div>

      <nav className={`border-b transition-all duration-300 ${isScrolled ? 'border-black/10 bg-[#faf8f3]/95 shadow-[0_8px_30px_rgba(17,18,15,0.07)] backdrop-blur-xl' : 'border-black/8 bg-[#faf8f3]'}`}>
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-[#11120f] lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>

          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="ShopHub home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#11120f] font-display text-xl font-bold italic text-[#cdb785] ring-1 ring-[#b69b63]/50 transition-transform duration-300 group-hover:rotate-[-8deg]">
              S
            </span>
            <span className="text-xl font-black tracking-[-0.045em] text-[#11120f] sm:text-2xl">SHOPHUB</span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href === '/products' && pathname.startsWith('/products'));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${active ? 'bg-[#e9e4da] text-[#11120f]' : 'text-[#61625c] hover:bg-black/[0.04] hover:text-[#11120f]'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-[260px] md:block">
            <label className="relative block">
              <span className="sr-only">Search the store</span>
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#77786f]" />
              <input
                type="search"
                placeholder="Search the collection"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 w-full rounded-full border border-black/10 bg-white/70 pl-10 pr-4 text-sm text-[#11120f] outline-none transition focus:border-[#a88d55] focus:bg-white focus:ring-4 focus:ring-[#a88d55]/12"
              />
            </label>
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <Link href="/account/wishlist" className="relative grid h-10 w-10 place-items-center rounded-full text-[#11120f] transition hover:bg-[#e9e4da]" aria-label="Wishlist">
                <HeartIcon className="h-5 w-5" />
                {wishlistCount > 0 && <span className="count-badge">{wishlistCount}</span>}
              </Link>
            )}

            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-[#11120f] transition hover:bg-[#e9e4da]" aria-label="Shopping bag">
              <BagIcon className="h-5 w-5" />
              {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="group relative">
                <button className="flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/70 px-2.5 text-sm font-semibold text-[#11120f] transition hover:bg-white">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#11120f] text-[10px] text-[#cdb785]">{user.firstName[0]}</span>
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
                <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 translate-y-2 rounded-2xl border border-black/10 bg-[#faf8f3] p-2 opacity-0 shadow-[0_20px_60px_rgba(17,18,15,0.16)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="border-b border-black/8 px-3 py-2.5">
                    <p className="font-semibold text-[#11120f]">{user.firstName} {user.lastName}</p>
                    <p className="mt-0.5 truncate text-xs text-[#77786f]">{user.email}</p>
                  </div>
                  <Link href="/account" className="nav-menu-item">My account</Link>
                  <Link href="/account/orders" className="nav-menu-item">Orders</Link>
                  <Link href="/account/wishlist" className="nav-menu-item">Saved items</Link>
                  {user.role === 'ADMIN' && <Link href="/admin" className="nav-menu-item text-[#806a3d]">Admin portal</Link>}
                  <button onClick={() => { setCartCount(0); setWishlistCount(0); logout(); }} className="nav-menu-item w-full text-left text-[#a03c2a]">Sign out</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden h-10 items-center gap-2 rounded-full border border-[#11120f] px-4 text-sm font-bold text-[#11120f] transition hover:bg-[#11120f] hover:text-[#d8c28f] sm:flex">
                <UserIcon className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-black/8 bg-[#faf8f3] px-4 pb-5 pt-4 shadow-xl lg:hidden">
            <form onSubmit={handleSearch} className="mb-4 md:hidden">
              <label className="relative block">
                <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#77786f]" />
                <input
                  type="search"
                  aria-label="Search the store"
                  placeholder="Search the collection"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 w-full rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#a88d55]"
                />
              </label>
            </form>
            <div className="grid gap-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Home</Link>
              {navLinks.map((link) => <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">{link.name}</Link>)}
              {!user && <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link text-[#806a3d]">Sign in</Link>}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
