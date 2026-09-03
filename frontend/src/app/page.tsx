'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, Category, Brand } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          api.products.getAll({ limit: 8 }),
          api.categories.getAll(),
          api.brands.getAll(),
        ]);
        setProducts(prodRes?.data || []);
        setCategories(catRes || []);
        setBrands(brandRes || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-blue-100">
            🔥 Limited Time Deals — Up to 50% Off
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Discover Premium Products <br className="hidden sm:inline" /> For Your Lifestyle
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Explore curated tech, fashion, books, and home essentials. Fast delivery and 100% verified authentic goods.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/products"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition shadow-lg text-base"
            >
              Shop All Products
            </Link>
            <Link
              href="/categories"
              className="border-2 border-white/80 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition text-base"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Coupon Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between">
          <div className="space-y-1 mb-4 sm:mb-0">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded">Exclusive Offer</span>
            <h3 className="text-2xl font-bold">Use Coupon Code <span className="underline decoration-wavy">SAVE10</span></h3>
            <p className="text-emerald-100 text-sm">Save 10% off your entire order on purchases over $50!</p>
          </div>
          <Link href="/products" className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition text-sm">
            Claim Offer →
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Featured Categories</h2>
            <p className="text-gray-500 text-sm mt-1">Browse by popular departments</p>
          </div>
          <Link href="/categories" className="text-blue-600 font-semibold text-sm hover:underline">
            View All →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md hover:border-blue-200 transition group flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                  {cat.name[0]}
                </div>
                <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition">{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Brands */}
      <section className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
            Top Brands Partnering With ShopHub
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70">
            {brands.map((brand) => (
              <span key={brand.id} className="text-xl font-bold font-mono tracking-widest text-gray-600">
                {brand.name.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">New Arrivals</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked trending products for you</p>
          </div>
          <Link href="/products" className="text-blue-600 font-semibold text-sm hover:underline">
            Browse All Products →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
