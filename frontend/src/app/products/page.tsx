'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product, Category, Brand } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('categoryId') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, search, sortBy, sortOrder]);

  async function loadFilterOptions() {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.categories.getAll(),
        api.brands.getAll(),
      ]);
      setCategories(catRes || []);
      setBrands(brandRes || []);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const params: any = {
        limit: 20,
        sortBy,
        sortOrder,
      };
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedBrand) params.brandId = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (search) params.search = search;

      const res = await api.products.getAll(params);
      setProducts(res?.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleResetFilters() {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('DESC');
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filter Panel */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button onClick={handleResetFilters} className="text-xs text-blue-600 font-semibold hover:underline">
            Reset All
          </button>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Keyword Search</label>
          <input
            type="text"
            placeholder="Product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brands */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Price Range ($)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Sort By</label>
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':');
              setSortBy(sb);
              setSortOrder(so as 'ASC' | 'DESC');
            }}
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="createdAt:DESC">Newest First</option>
            <option value="price:ASC">Price: Low to High</option>
            <option value="price:DESC">Price: High to Low</option>
            <option value="name:ASC">Name: A to Z</option>
          </select>
        </div>
      </aside>

      {/* Product Catalog Grid */}
      <main className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="font-bold text-gray-900">{products.length}</span> products
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-2">No products match your search criteria.</p>
            <button onClick={handleResetFilters} className="text-blue-600 font-semibold hover:underline">
              Clear filters and try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
