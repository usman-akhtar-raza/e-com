'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { BagIcon, HeartIcon } from '@/components/ui/Icons';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  async function handleToggleWishlist(event: React.MouseEvent) {
    event.preventDefault();
    if (!user) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }

    try {
      if (isWishlisted) await api.wishlist.removeItem(product.id);
      else await api.wishlist.addItem(product.id);
      setIsWishlisted((saved) => !saved);
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  }

  async function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    if (!user) {
      alert('Please sign in to add items to your cart.');
      return;
    }

    setAddingToCart(true);
    try {
      await api.cart.addItem(product.id, 1);
      alert(`${product.name} added to your bag.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <article className="product-card group flex h-full flex-col">
      <Link href={`/products/${product.slug}`} className="product-card-image relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-[#e7e4de]">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-[#927a48] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
            Save {discountPercentage}%
          </span>
        )}

        <button
          onClick={handleToggleWishlist}
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-[#faf8f3]/90 shadow-sm backdrop-blur-md transition duration-300 hover:scale-105 ${isWishlisted ? 'text-[#927a48]' : 'text-[#11120f]'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <HeartIcon className={`h-[18px] w-[18px] ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="absolute bottom-3 left-3 right-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-[#11120f] px-4 py-3 text-xs font-bold text-white opacity-0 shadow-xl transition duration-300 hover:bg-[#b69b63] hover:text-[#11120f] disabled:cursor-wait disabled:opacity-60 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          <BagIcon className="h-4 w-4" /> {addingToCart ? 'Adding…' : 'Add to bag'}
        </button>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#806a3d]">
            {product.brand?.name || product.category?.name || 'ShopHub edit'}
          </span>
          <Rating value={product.averageRating || 4.5} />
        </div>

        <Link href={`/products/${product.slug}`} className="line-clamp-2 font-display text-[22px] leading-tight tracking-[-0.025em] text-[#11120f] transition hover:text-[#806a3d]">
          {product.name}
        </Link>

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-sm font-bold text-[#11120f]">{formatPrice(product.price)}</span>
          {hasDiscount && <span className="text-xs text-[#8b8c83] line-through">{formatPrice(product.compareAtPrice!)}</span>}
        </div>
      </div>
    </article>
  );
}
