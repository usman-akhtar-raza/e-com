
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images?.[0] || '/placeholder.jpg';
  
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <Link href={`/products/${product.slug}`} className="relative aspect-square block bg-gray-100">
        <div className="absolute inset-0 flex justify-center items-center text-gray-400">Image</div>
        <img src={imageUrl} alt={product.name} className="object-cover w-full h-full absolute inset-0 z-10" />
        {product.category && (
          <div className="absolute top-2 left-2 z-20">
            <Badge variant="blue">{product.category.name}</Badge>
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2 mb-2">
          {product.name}
        </Link>
        <div className="mb-2">
          <Rating value={product.averageRating || 0} />
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg text-gray-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="ml-2 text-sm text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <Button size="sm">Add</Button>
        </div>
      </div>
    </div>
  );
}
