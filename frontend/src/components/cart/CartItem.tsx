
'use client';
import { CartItem as ICartItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

export function CartItem({ item, onUpdate, onRemove }: { item: ICartItem, onUpdate: (id: string, qty: number) => void, onRemove: (id: string) => void }) {
  return (
    <div className="flex py-6 border-b">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
        <img src={item.product.images?.[0] || '/placeholder.jpg'} alt={item.product.name} className="h-full w-full object-cover object-center" />
      </div>
      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.product.name}</h3>
            <p className="ml-4">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center border rounded">
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100" onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}>-</button>
            <span className="px-2 py-1 border-x">{item.quantity}</span>
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100" onClick={() => onUpdate(item.id, item.quantity + 1)}>+</button>
          </div>
          <button type="button" onClick={() => onRemove(item.id)} className="font-medium text-blue-600 hover:text-blue-500">Remove</button>
        </div>
      </div>
    </div>
  );
}
