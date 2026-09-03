
'use client';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { AdminPageHeader } from '@/components/admin/AdminPageChrome';
import { ArrowIcon, PackageIcon } from '@/components/ui/Icons';

export default function AdminNewProductPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/products" className="admin-text-action inline-flex items-center gap-2"><ArrowIcon className="h-3.5 w-3.5 rotate-180" /> Back to catalogue</Link>
      </div>
      <AdminPageHeader
        eyebrow="New merchandise"
        title="Create a product."
        description="Build a polished product listing with considered copy, pricing and inventory details."
        action={<button type="button" className="admin-primary-action">Save product <ArrowIcon className="h-4 w-4" /></button>}
      />
      <form className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr]">
        <section className="admin-panel space-y-6">
          <div className="border-b border-black/[0.07] pb-5">
            <p className="admin-eyebrow">Essential details</p>
            <h2 className="font-display text-3xl tracking-[-0.04em]">Product story</h2>
          </div>
          <Input label="Product name" placeholder="e.g. Sculpted leather weekender" />
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</label>
            <textarea className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm outline-none transition focus:border-[#a88d55] focus:ring-2 focus:ring-[#a88d55]/20" rows={6} placeholder="Describe the materials, details and character of this product." />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Price" type="number" step="0.01" placeholder="0.00" />
            <Input label="Compare at price" type="number" step="0.01" placeholder="0.00" />
            <Input label="SKU" placeholder="SKU-001" />
            <Input label="Stock quantity" type="number" placeholder="0" />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="admin-panel">
            <p className="admin-eyebrow">Product image</p>
            <div className="mt-4 grid min-h-60 place-items-center rounded-2xl border border-dashed border-black/15 bg-[#f3f0e9] p-6 text-center">
              <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#806a3d] shadow-sm"><PackageIcon className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold">Add product media</p><p className="mt-1 text-xs leading-5 text-[#77786f]">High-resolution square images work best.</p><button type="button" className="admin-text-action mt-4">Choose image</button></div>
            </div>
          </section>
          <section className="rounded-[24px] bg-[#11120f] p-6 text-[#f4f1ea] shadow-[0_18px_45px_rgba(17,18,15,0.16)]">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b69b63]">Publishing</p>
            <h2 className="mt-3 font-display text-3xl">Ready when you are.</h2>
            <p className="mt-3 text-xs leading-5 text-white/55">Review your content and save the product when every detail feels right.</p>
            <button type="button" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f4f1ea] px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#11120f] transition hover:bg-[#d8c28f]">Save product <ArrowIcon className="h-4 w-4" /></button>
          </section>
        </aside>
      </form>
    </div>
  );
}
