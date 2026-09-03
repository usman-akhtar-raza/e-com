
'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CheckoutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" />
            <Input label="Last Name" />
            <Input label="Street Address" className="md:col-span-2" />
            <Input label="City" />
            <Input label="State" />
            <Input label="ZIP Code" />
            <Input label="Country" />
          </div>
        </div>
        <div className="w-full lg:w-96 bg-white border rounded-lg p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <Button className="w-full mt-4">Place Order</Button>
        </div>
      </div>
    </div>
  );
}
