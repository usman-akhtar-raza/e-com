'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      if (isWishlisted) {
        await api.wishlist.removeItem(product.id);
        setIsWishlisted(false);
      } else {
        await api.wishlist.addItem(product.id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    setAddingToCart(true);
    try {
      await api.cart.addItem(product.id, 1);
      alert(`✓ ${product.name} added to cart!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full relative">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square block bg-slate-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category Pill */}
        {product.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 border border-white/60 shadow-sm">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-md shadow-rose-600/30">
              -{discountPct}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md border border-white/60 flex items-center justify-center text-slate-700 hover:text-rose-600 hover:bg-white shadow-sm transition duration-200 active:scale-90"
          title="Save to Wishlist"
        >
          <span className={`text-base transition-transform duration-200 ${isWishlisted ? 'scale-125' : ''}`}>
            {isWishlisted ? '❤️' : '🤍'}
          </span>
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1.5">
          {product.brand ? (
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              {product.brand.name}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400">ShopHub Verified</span>
          )}

          <div className="flex items-center space-x-1">
            <Rating value={product.averageRating || 4.5} />
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className="font-bold text-slate-900 hover:text-blue-600 line-clamp-2 text-sm mb-3 transition">
          {product.name}
        </Link>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-base text-slate-900">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="ml-1.5 text-xs text-slate-400 line-through font-medium">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 transition duration-200"
          >
            {addingToCart ? '...' : '+ Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}
