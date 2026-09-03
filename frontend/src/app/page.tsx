'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Brand, Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowIcon, ArrowUpRightIcon, RefreshIcon, ShieldIcon, SparkIcon, TruckIcon } from '@/components/ui/Icons';

const categoryColors = ['#171916', '#55594f', '#8a7a60', '#303740', '#70675c'];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productResponse, categoryResponse, brandResponse] = await Promise.all([
          api.products.getAll({ limit: 8 }),
          api.categories.getAll(),
          api.brands.getAll(),
        ]);
        setProducts(productResponse?.data || []);
        setCategories(categoryResponse || []);
        setBrands(brandResponse || []);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="overflow-hidden bg-[#f4f1ea] text-[#11120f]">
      <section className="px-3 pb-8 pt-3 sm:px-5 lg:px-7">
        <div className="editorial-hero mx-auto grid min-h-[620px] max-w-[1440px] overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#e9e5dc] shadow-[0_30px_90px_rgba(17,18,15,0.08)] lg:grid-cols-[0.86fr_1.14fr] lg:rounded-[40px]">
          <div className="relative z-10 flex flex-col justify-between px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 xl:px-20">
            <div className="hero-reveal inline-flex w-fit items-center gap-2 rounded-full border border-[#11120f]/15 bg-white/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
              <SparkIcon className="h-3.5 w-3.5 text-[#8c7340]" /> The new edit · 2026
            </div>

            <div className="my-12 max-w-[570px] lg:my-6">
              <p className="hero-reveal hero-delay-1 mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#75633f]">Objects for a life well lived</p>
              <h1 className="hero-reveal hero-delay-2 font-display text-[clamp(3.55rem,5.8vw,6.6rem)] leading-[0.82] tracking-[-0.065em]">
                Better finds.<br />
                <em className="font-normal text-[#9a7f47]">Beautifully</em> chosen.
              </h1>
              <p className="hero-reveal hero-delay-3 mt-8 max-w-md text-base leading-7 text-[#5f6059] sm:text-lg">
                Distinctive tech, style and home essentials—selected for lasting quality, thoughtful design and everyday delight.
              </p>
              <div className="hero-reveal hero-delay-4 mt-9 flex flex-wrap items-center gap-3">
                <Link href="/products" className="primary-pill">
                  Shop the collection <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link href="/categories" className="secondary-pill">Explore departments</Link>
              </div>
            </div>

            <div className="flex items-center gap-8 border-t border-[#11120f]/15 pt-5 text-xs font-semibold text-[#5f6059]">
              <span><strong className="mr-1.5 text-[#11120f]">4.9/5</strong> from verified buyers</span>
              <span className="hidden sm:inline"><strong className="mr-1.5 text-[#11120f]">10k+</strong> orders delivered</span>
            </div>
          </div>

          <div className="relative min-h-[500px] overflow-hidden lg:min-h-full">
            <Image
              src="/images/home/editorial-collection-obsidian.png"
              alt="A curated collection of headphones, a lamp, a leather sneaker, watch and knitwear"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-center transition-transform duration-[1600ms] ease-out hover:scale-[1.025]"
            />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 to-transparent lg:hidden" />
            <div className="floating-note absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4 rounded-2xl border border-white/30 bg-[#faf8f2]/88 p-4 shadow-2xl backdrop-blur-xl sm:bottom-8 sm:left-auto sm:right-8 sm:w-[310px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#806b3f]">This week only</p>
                <p className="mt-1 font-display text-2xl tracking-tight">The autumn edit</p>
              </div>
              <Link href="/products" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#a88d55] text-white transition hover:rotate-12 hover:bg-[#11120f]" aria-label="Shop the autumn edit">
                <ArrowUpRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#11120f]/10 bg-[#faf8f3]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 divide-y divide-[#11120f]/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-10">
          {[
            { icon: TruckIcon, title: 'Complimentary delivery', text: 'On orders over $100' },
            { icon: RefreshIcon, title: 'Easy returns', text: '30 days to decide' },
            { icon: ShieldIcon, title: 'Curated & verified', text: 'Quality you can trust' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center justify-center gap-4 py-6 sm:px-5">
              <Icon className="h-6 w-6 text-[#927a48]" />
              <div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs text-[#74756e]">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-7 lg:px-10 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Shop your way</p>
            <h2 className="section-title">Curated by category.</h2>
          </div>
          <Link href="/categories" className="text-link hidden sm:inline-flex">View all categories <ArrowIcon className="h-4 w-4" /></Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:gap-5">
            {categories.slice(0, 5).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="category-tile group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[22px] p-5 sm:min-h-[320px] sm:p-6"
                style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
              >
                <div className="absolute -right-8 top-12 font-display text-[10rem] leading-none text-white/10 transition duration-500 group-hover:scale-110 group-hover:text-white/15 sm:text-[13rem]">
                  {category.name.charAt(0)}
                </div>
                <span className="relative text-xs font-bold text-white/75">0{index + 1}</span>
                <div className="relative">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">Explore</p>
                  <h3 className="font-display text-3xl leading-none tracking-tight text-white sm:text-4xl">{category.name}</h3>
                  <span className="mt-5 grid h-10 w-10 place-items-center rounded-full border border-white/35 text-white transition duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#11120f]">
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link href="/categories" className="text-link mt-7 inline-flex sm:hidden">View all categories <ArrowIcon className="h-4 w-4" /></Link>
      </section>

      <section className="bg-[#11120f] py-8 text-[#f4f1ea]">
        <div className="brand-marquee flex min-w-max items-center gap-12 pr-12 sm:gap-20 sm:pr-20">
          {[...brands, ...brands].map((brand, index) => (
            <span key={`${brand.id}-${index}`} className="flex items-center gap-12 text-xl font-black tracking-[-0.035em] sm:gap-20 sm:text-2xl">
              {brand.name.toUpperCase()} <span className="h-1.5 w-1.5 rounded-full bg-[#b69b63]" />
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-7 lg:px-10 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Freshly selected</p>
            <h2 className="section-title">New and noteworthy.</h2>
          </div>
          <Link href="/products" className="text-link hidden sm:inline-flex">See the full edit <ArrowIcon className="h-4 w-4" /></Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
            {products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="px-3 pb-24 sm:px-5 lg:px-7 lg:pb-32">
        <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[28px] border border-[#b69b63]/30 bg-[#11120f] text-white shadow-[0_35px_100px_rgba(17,18,15,0.18)] lg:grid-cols-[1.2fr_0.8fr] lg:rounded-[40px]">
          <div className="p-8 sm:p-12 lg:p-16 xl:p-20">
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.22em] text-white/65">The ShopHub promise</p>
            <blockquote className="max-w-4xl font-display text-[clamp(2.8rem,5.5vw,6.2rem)] leading-[0.9] tracking-[-0.05em]">
              Less scrolling.<br /><em className="font-normal text-[#cdb785]">More discovering.</em>
            </blockquote>
            <p className="mt-8 max-w-xl text-base leading-7 text-white/75 sm:text-lg">We sift through the ordinary to bring you pieces with purpose, personality and staying power.</p>
          </div>
          <div className="flex min-h-[320px] flex-col justify-between border-t border-[#11120f]/15 bg-[#b69b63] p-8 text-[#11120f] sm:p-12 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-16">
            <span className="font-display text-8xl leading-none text-[#11120f]/20">“</span>
            <div>
              <p className="font-display text-3xl leading-tight">“Everything feels considered—from the products to the packaging.”</p>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#11120f]/55">Nadia K. · Verified buyer</p>
              <Link href="/products" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#11120f] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#11120f]">Start exploring <ArrowIcon className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
