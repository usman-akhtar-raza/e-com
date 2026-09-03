'use client';

import { Suspense, useDeferredValue, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Brand, Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CloseIcon, GridIcon, SearchIcon, SlidersIcon, SparkIcon } from '@/components/ui/Icons';

type SortOrder = 'ASC' | 'DESC';
type ProductQuery = {
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};

const sortOptions = [
  { value: 'createdAt:DESC', label: 'Newest first' },
  { value: 'price:ASC', label: 'Price: low to high' },
  { value: 'price:DESC', label: 'Price: high to low' },
  { value: 'name:ASC', label: 'Name: A–Z' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(searchParams.get('sortOrder') === 'ASC' ? 'ASC' : 'DESC');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;
    async function fetchFilterOptions() {
      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          api.categories.getAll(),
          api.brands.getAll(),
        ]);
        if (!active) return;
        setCategories(categoryResponse || []);
        setBrands(brandResponse || []);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    }
    fetchFilterOptions();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchProducts() {
      setLoading(true);
      const query: ProductQuery = { limit: 24, sortBy, sortOrder };
      if (selectedCategory) query.categoryId = selectedCategory;
      if (selectedBrand) query.brandId = selectedBrand;
      if (minPrice) query.minPrice = Number(minPrice);
      if (maxPrice) query.maxPrice = Number(maxPrice);
      if (deferredSearch.trim()) query.search = deferredSearch.trim();

      try {
        const response = await api.products.getAll(query);
        if (active) setProducts(response?.data || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchProducts();
    return () => { active = false; };
  }, [deferredSearch, maxPrice, minPrice, selectedBrand, selectedCategory, sortBy, sortOrder]);

  const activeFilterCount = [selectedCategory, selectedBrand, minPrice, maxPrice, deferredSearch].filter(Boolean).length;
  const activeCategory = categories.find((category) => category.id === selectedCategory);
  const activeBrand = brands.find((brand) => brand.id === selectedBrand);

  function handleResetFilters() {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
  }

  function handleSort(value: string) {
    const [field, order] = value.split(':');
    setSortBy(field);
    setSortOrder(order as SortOrder);
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] pb-24 text-[#11120f]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#11120f] text-white">
        <div className="catalog-glow absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-14 sm:px-7 sm:py-20 lg:px-10">
          <div className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            <Link href="/" className="transition hover:text-[#cdb785]">Home</Link>
            <span>/</span>
            <span className="text-[#cdb785]">The collection</span>
          </div>
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.75fr]">
            <div>
              <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#cdb785]">
                <SparkIcon className="h-4 w-4" /> Curated essentials
              </p>
              <h1 className="font-display text-[clamp(3.8rem,7vw,7.5rem)] leading-[0.82] tracking-[-0.06em]">
                The complete<br /><em className="font-normal text-[#b69b63]">collection.</em>
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/55 sm:text-base lg:justify-self-end">
              Explore considered objects for work, home and everywhere between. Every piece is selected for design, quality and lasting usefulness.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-7 lg:px-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 border-b border-black/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <GridIcon className="h-4 w-4 text-[#806a3d]" />
            <p className="text-sm font-semibold">
              {loading ? 'Curating the collection…' : <><span className="font-black">{products.length}</span> pieces found</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((open) => !open)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-black/15 bg-[#faf8f3] px-4 text-xs font-bold lg:hidden"
              aria-expanded={mobileFiltersOpen}
            >
              {mobileFiltersOpen ? <CloseIcon className="h-4 w-4" /> : <SlidersIcon className="h-4 w-4" />}
              Filters {activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#11120f] px-1 text-[10px] text-white">{activeFilterCount}</span>}
            </button>
            <label className="relative min-w-[190px] flex-1 sm:flex-none">
              <span className="sr-only">Sort products</span>
              <select value={`${sortBy}:${sortOrder}`} onChange={(event) => handleSort(event.target.value)} className="catalog-select h-11 w-full rounded-full pl-4 pr-10 text-xs font-bold">
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-14">
          <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} catalog-filter-panel h-fit rounded-[24px] border border-black/10 bg-[#faf8f3] p-5 shadow-[0_18px_50px_rgba(17,18,15,0.06)] lg:sticky lg:top-[130px] lg:block lg:p-6`}>
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-5">
              <div className="flex items-center gap-2">
                <SlidersIcon className="h-4 w-4 text-[#806a3d]" />
                <h2 className="text-sm font-black">Refine</h2>
              </div>
              {activeFilterCount > 0 && <button type="button" onClick={handleResetFilters} className="text-[10px] font-black uppercase tracking-[0.12em] text-[#806a3d] hover:underline">Clear all</button>}
            </div>

            <div className="space-y-7">
              <FilterGroup label="Search">
                <label className="relative block">
                  <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#77786f]" />
                  <input
                    type="search"
                    placeholder="Search products"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="catalog-input h-11 w-full rounded-xl pl-10 pr-3 text-sm"
                  />
                </label>
              </FilterGroup>

              <FilterGroup label="Category">
                <div className="space-y-1">
                  <FilterOption active={!selectedCategory} label="All categories" onClick={() => setSelectedCategory('')} />
                  {categories.map((category) => (
                    <FilterOption key={category.id} active={selectedCategory === category.id} label={category.name} onClick={() => setSelectedCategory(category.id)} />
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Brand">
                <select value={selectedBrand} onChange={(event) => setSelectedBrand(event.target.value)} className="catalog-select h-11 w-full rounded-xl px-3 text-xs font-bold">
                  <option value="">All brands</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Price range">
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" aria-label="Minimum price" placeholder="Min $" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="catalog-input h-11 min-w-0 rounded-xl px-3 text-xs" />
                  <input type="number" min="0" aria-label="Maximum price" placeholder="Max $" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="catalog-input h-11 min-w-0 rounded-xl px-3 text-xs" />
                </div>
              </FilterGroup>
            </div>
          </aside>

          <main className="min-w-0">
            {activeFilterCount > 0 && (
              <div className="mb-7 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#74756e]">Active</span>
                {activeCategory && <FilterChip label={activeCategory.name} onRemove={() => setSelectedCategory('')} />}
                {activeBrand && <FilterChip label={activeBrand.name} onRemove={() => setSelectedBrand('')} />}
                {deferredSearch && <FilterChip label={`“${deferredSearch}”`} onRemove={() => setSearch('')} />}
                {minPrice && <FilterChip label={`From $${minPrice}`} onRemove={() => setMinPrice('')} />}
                {maxPrice && <FilterChip label={`Up to $${maxPrice}`} onRemove={() => setMaxPrice('')} />}
              </div>
            )}

            {loading ? (
              <div className="grid min-h-[420px] place-items-center rounded-[28px] border border-black/[0.06] bg-[#faf8f3]"><LoadingSpinner /></div>
            ) : products.length === 0 ? (
              <div className="grid min-h-[460px] place-items-center rounded-[28px] border border-black/10 bg-[#faf8f3] p-8 text-center">
                <div>
                  <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-[#b69b63]/45 bg-[#b69b63]/10 text-[#806a3d]"><SearchIcon className="h-6 w-6" /></span>
                  <h3 className="font-display text-4xl tracking-[-0.04em]">Nothing matched.</h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6c6d66]">Try a broader search or clear your filters to rediscover the complete collection.</p>
                  <button type="button" onClick={handleResetFilters} className="primary-pill mt-7">Reset filters</button>
                </div>
              </div>
            ) : (
              <div className="catalog-grid grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-5">
                {products.map((product, index) => (
                  <div key={product.id} className="catalog-card-reveal" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#74756e]">{label}</h3>{children}</div>;
}

function FilterOption({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${active ? 'bg-[#11120f] text-white' : 'text-[#5f605a] hover:bg-[#ece8df] hover:text-[#11120f]'}`}>
      {label}<span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#cdb785]' : 'bg-transparent'}`} />
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#faf8f3] px-3 py-1.5 text-[11px] font-bold text-[#4f504a] transition hover:border-[#a88d55]/50 hover:text-[#806a3d]">
      {label}<CloseIcon className="h-3 w-3" />
    </button>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f4f1ea] py-24"><LoadingSpinner /></div>}><ProductsContent /></Suspense>;
}
