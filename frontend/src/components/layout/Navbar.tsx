'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

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
    function handleScroll() {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.cart.get()
        .then(cart => {
          const totalQty = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
          setCartCount(totalQty);
        })
        .catch(() => setCartCount(0));

      api.wishlist.get()
        .then(items => {
          setWishlistCount(items?.length || 0);
        })
        .catch(() => setWishlistCount(0));
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user, pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm py-2'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-100 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-300">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-700 bg-clip-text text-transparent">
              ShopHub
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, categories, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-full text-sm font-medium transition duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400"
              />
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">
                🔍
              </span>
              <button
                type="submit"
                className="absolute right-1.5 top-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-3 py-1 text-xs font-semibold hover:opacity-90 transition shadow-sm"
              >
                Go
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full transition duration-200 ${
                    isActive
                      ? 'bg-slate-100 text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            {user && (
              <Link
                href="/account/wishlist"
                className="p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-full relative transition duration-200"
                title="Saved Wishlist"
              >
                <span className="text-xl">❤️</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse-glow shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              href="/cart"
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full relative transition duration-200"
              title="Shopping Cart"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-md shadow-blue-500/30">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition duration-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.firstName[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline">{user.firstName}</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 w-52 mt-2 py-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                  </div>
                  <Link href="/account" className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition">
                    Dashboard Overview
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition">
                    My Orders
                  </Link>
                  <Link href="/account/wishlist" className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition">
                    Saved Wishlist
                  </Link>
                  <Link href="/account/addresses" className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition">
                    Address Book
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 border-t border-slate-100 mt-1 transition"
                    >
                      ⚡ Admin Portal
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
