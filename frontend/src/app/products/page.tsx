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
        limit: 24,
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
      {/* Glass Sidebar Filter Panel */}
      <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 shadow-sm h-fit">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Catalog Filters</span>
          </h2>
          <button onClick={handleResetFilters} className="text-xs text-blue-600 font-bold hover:underline">
            Reset All
          </button>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Search Catalog</label>
          <input
            type="text"
            placeholder="Product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brands */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Price Filter ($)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min ($)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50"
            />
            <input
              type="number"
              placeholder="Max ($)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50"
            />
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sort Ordering</label>
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':');
              setSortBy(sb);
              setSortOrder(so as 'ASC' | 'DESC');
            }}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-slate-50"
          >
            <option value="createdAt:DESC">Newest Arrivals</option>
            <option value="price:ASC">Price: Low to High</option>
            <option value="price:DESC">Price: High to Low</option>
            <option value="name:ASC">Product Name: A-Z</option>
          </select>
        </div>
      </aside>

      {/* Main Products Grid */}
      <main className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Displaying <span className="text-blue-600 font-black">{products.length}</span> Verified Products
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-xl font-extrabold text-slate-900">No Matching Products Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Try clearing active search filters or selecting another category.</p>
            <button
              onClick={handleResetFilters}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-2.5 rounded-full text-xs hover:shadow-lg transition"
            >
              Reset Filters
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<LoadingSpinner />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
