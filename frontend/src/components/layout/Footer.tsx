'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowIcon } from '@/components/ui/Icons';

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  }

  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="mt-auto bg-[#11120f] text-[#f4f1ea]">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="grid gap-14 border-b border-white/12 pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b69b63]">A better kind of inbox</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.8rem,5vw,5.5rem)] leading-[0.9] tracking-[-0.05em]">
              New finds, good stories,<br /><em className="font-normal text-[#cdb785]">less noise.</em>
            </h2>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <p className="mb-5 text-sm leading-6 text-white/55">Join our edit for new arrivals, considered recommendations and occasional offers worth opening.</p>
            {subscribed ? (
              <div className="rounded-2xl border border-[#b69b63]/40 bg-[#b69b63]/10 px-5 py-4 text-sm font-semibold text-[#d8c28f]">You’re on the list. Welcome to ShopHub.</div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 border-b border-white/40 pb-2 transition focus-within:border-[#b69b63]">
                <label className="sr-only" htmlFor="footer-email">Email address</label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/35"
                />
                <button type="submit" className="flex h-11 items-center gap-2 rounded-full bg-[#f4f1ea] px-5 text-sm font-bold text-[#11120f] transition hover:bg-[#b69b63]">
                  Subscribe <ArrowIcon className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label="ShopHub home">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[#b69b63]/60 bg-[#11120f] font-display text-xl font-bold italic text-[#cdb785]">S</span>
              <span className="text-2xl font-black tracking-[-0.045em]">SHOPHUB</span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-white/50">Everyday objects with exceptional form, function and staying power.</p>
          </div>

          <FooterColumn title="Discover" links={[
            ['New arrivals', '/products'], ['All products', '/products'], ['Collections', '/categories'], ['Your wishlist', '/account/wishlist'],
          ]} />
          <FooterColumn title="Customer care" links={[
            ['My orders', '/account/orders'], ['Shopping bag', '/cart'], ['My account', '/account'], ['Sign in', '/login'],
          ]} />
          <div>
            <h3 className="footer-heading">Our standards</h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>Verified quality</li><li>Secure checkout</li><li>Considered packaging</li><li>30-day returns</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/12 pt-7 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ShopHub. Curated with care.</p>
          <div className="flex flex-wrap gap-5"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>Cash on delivery</span></div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="footer-heading">{title}</h3>
      <ul className="space-y-3 text-sm text-white/50">
        {links.map(([label, href]) => <li key={label}><Link href={href} className="transition hover:text-[#cdb785]">{label}</Link></li>)}
      </ul>
    </div>
  );
}
