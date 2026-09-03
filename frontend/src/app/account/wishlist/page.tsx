'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { WishlistItem } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      const data = await api.wishlist.get();
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Saved Wishlist</h1>
        <p className="text-slate-500 text-sm mt-1">Products you saved to buy later.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-sm text-center py-16 px-4 animate-slide-up">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Wishlist is empty</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't saved any products yet. Heart your favorites while shopping!</p>
          <Link href="/products" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition font-semibold">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
