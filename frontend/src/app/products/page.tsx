
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
// For brevity, assuming we have filters on the left
export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-lg font-bold mb-4">Filters</h2>
          {/* Filters component here */}
          <div className="bg-white p-4 border rounded shadow-sm">
            <p className="text-sm text-gray-500">Category, Price, Sort filters will go here.</p>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6">Products</h1>
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductGrid products={[]} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
