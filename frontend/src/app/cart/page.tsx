
'use client';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white border rounded-lg p-6 shadow-sm">
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Your cart is empty.</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-96 bg-white border rounded-lg p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">$0.00</span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">$0.00</span>
          </div>
          <Link href="/checkout">
            <Button className="w-full" disabled>Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
