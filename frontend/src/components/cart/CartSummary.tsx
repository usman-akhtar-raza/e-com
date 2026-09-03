
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export function CartSummary({ subtotal }: { subtotal: number }) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>
      <div className="flex justify-between mb-2 text-gray-600">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between mb-4 pb-4 border-b text-gray-600">
        <span>Shipping</span>
        <span className="text-green-600">Calculated at checkout</span>
      </div>
      <div className="flex justify-between mb-6">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
      </div>
      <Link href="/checkout">
        <Button className="w-full">Proceed to Checkout</Button>
      </Link>
    </div>
  );
}
