'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

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
  }, [user]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <nav className="sticky top-0 bg-white shadow-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center space-x-4">
          <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight flex-shrink-0">
            ShopHub
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50/50"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600">
                🔍
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition">Products</Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition">Categories</Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link href="/account/wishlist" className="text-gray-700 hover:text-blue-600 relative p-1 transition" title="Wishlist">
                <span className="text-xl">❤️</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/cart" className="text-gray-700 hover:text-blue-600 relative p-1 transition" title="Shopping Cart">
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-600 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {user.firstName[0]}
                  </div>
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">Account Overview</Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                  <Link href="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Saved Wishlist</Link>
                  <Link href="/account/addresses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Address Book</Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold border-t border-gray-100 mt-1">Admin Portal</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 font-medium">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
