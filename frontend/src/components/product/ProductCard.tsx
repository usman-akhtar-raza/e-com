'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save items to your wishlist.');
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
      alert('Please log in to add items to cart.');
      return;
    }
    setAddingToCart(true);
    try {
      await api.cart.addItem(product.id, 1);
      alert(`${product.name} added to cart!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative">
      <Link href={`/products/${product.slug}`} className="relative aspect-square block bg-gray-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {product.category && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="blue">{product.category.name}</Badge>
          </div>
        )}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-red-500 shadow-sm transition"
          title="Save to Wishlist"
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 mb-1">
          {product.name}
        </Link>
        <div className="mb-3">
          <Rating value={product.averageRating || 4.5} />
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <Button size="sm" onClick={handleAddToCart} disabled={addingToCart}>
            {addingToCart ? '...' : '+ Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
