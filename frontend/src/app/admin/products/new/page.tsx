
'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminNewProductPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Product</h1>
      <form className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <Input label="Product Name" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-3" rows={4}></textarea>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Input label="Price" type="number" step="0.01" />
          <Input label="Compare at Price" type="number" step="0.01" />
          <Input label="SKU" />
          <Input label="Stock Quantity" type="number" />
        </div>
        <Button type="button">Save Product</Button>
      </form>
    </div>
  );
}
