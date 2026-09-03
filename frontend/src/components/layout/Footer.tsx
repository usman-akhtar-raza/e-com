'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  }

  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">ShopHub</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your premier e-commerce platform delivering authentic quality products, fast shipping, and 100% verified customer ratings.
            </p>
            <div className="flex space-x-3 text-lg">
              <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 transition cursor-pointer">🌐</span>
              <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 transition cursor-pointer">📦</span>
              <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 transition cursor-pointer">🔒</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/products" className="hover:text-blue-400 transition">Catalog Store</Link></li>
              <li><Link href="/categories" className="hover:text-blue-400 transition">Featured Categories</Link></li>
              <li><Link href="/cart" className="hover:text-blue-400 transition">My Shopping Cart</Link></li>
              <li><Link href="/account/orders" className="hover:text-blue-400 transition">Track Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li><span className="text-slate-400">Help Center & FAQ</span></li>
              <li><span className="text-slate-400">Shipping & Return Policies</span></li>
              <li><span className="text-slate-400">Privacy Policy & Terms</span></li>
              <li><span className="text-slate-400">Verified Seller Reviews</span></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Subscribe for Updates</h4>
            <p className="text-xs text-slate-400">Get exclusive promotional codes like <span className="font-mono text-blue-400 font-bold">SAVE10</span> delivered to your inbox.</p>
            {subscribed ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-l-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-r-xl hover:opacity-90 transition"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} ShopHub Inc. All rights reserved.</p>
          <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
            <span className="bg-slate-900 px-2 py-1 rounded">VISA</span>
            <span className="bg-slate-900 px-2 py-1 rounded">MASTERCARD</span>
            <span className="bg-slate-900 px-2 py-1 rounded">AMEX</span>
            <span className="bg-slate-900 px-2 py-1 rounded">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
