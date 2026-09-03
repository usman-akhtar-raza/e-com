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
    <div className="space-y-20 pb-20 bg-mesh-gradient min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-hero-gradient text-white py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-blue-200 border border-white/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Flash Sale Active — Up to 50% Off</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Elevate Your <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                Digital Lifestyle
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Explore authentic tech, apparel, books, and home products curated for modern standards with 100% verified buyer ratings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/products"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 transition duration-200 text-sm text-center"
              >
                Shop All Catalog →
              </Link>
              <Link
                href="/categories"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 active:scale-95 transition duration-200 text-sm text-center"
              >
                Browse Categories
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 text-center lg:text-left">
              <div>
                <p className="text-2xl font-black text-white">10K+</p>
                <p className="text-xs text-slate-400 font-medium">Delivered Orders</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">99.8%</p>
                <p className="text-xs text-slate-400 font-medium">Positive Feedback</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-400">24/7</p>
                <p className="text-xs text-slate-400 font-medium">Customer Support</p>
              </div>
            </div>
          </div>

          {/* Hero Floating Visual Card */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="w-96 h-96 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl flex flex-col justify-between animate-float">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">ShopHub Verified</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  In Stock
                </span>
              </div>
              <div className="py-6 space-y-2">
                <p className="text-2xl font-bold text-white">Premium Electronics & Fashion Collection</p>
                <p className="text-xs text-slate-300">Free 2-day shipping on orders over $100.</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400">Special Promo</p>
                  <p className="text-lg font-extrabold text-blue-400 font-mono">SAVE10</p>
                </div>
                <Link href="/products" className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition">
                  Claim Deal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest border border-blue-500/30">
              Limited Edition Promo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Use Code <span className="font-mono text-blue-400 underline decoration-wavy">SAVE10</span> for 10% Instant Discount
            </h2>
            <p className="text-slate-400 text-sm">Valid on all orders above $50. Automatically applied at checkout!</p>
          </div>
          <Link
            href="/products"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition text-sm flex-shrink-0"
          >
            Start Shopping Now →
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Featured Categories</h2>
            <p className="text-slate-500 text-sm mt-1">Explore our top product departments</p>
          </div>
          <Link href="/categories" className="text-blue-600 font-bold text-sm hover:underline flex items-center space-x-1">
            <span>Explore All</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="group bg-white/80 backdrop-blur-md border border-slate-200/70 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition duration-300 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-black text-2xl mb-4 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition duration-300 shadow-sm">
                  {cat.name[0]}
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Brands Showcase Bar */}
      <section className="bg-slate-900 py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-6">
            Official Brand Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-20">
            {brands.map((b) => (
              <span key={b.id} className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-400 hover:text-white transition cursor-pointer">
                {b.name.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">New Arrivals</h2>
            <p className="text-slate-500 text-sm mt-1">Trending products hot off the shelf</p>
          </div>
          <Link href="/products" className="text-blue-600 font-bold text-sm hover:underline flex items-center space-x-1">
            <span>Browse Full Catalog</span>
            <span>→</span>
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
