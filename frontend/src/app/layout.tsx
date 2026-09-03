import './globals.css';
import { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ShopHub — Better Finds, Beautifully Chosen',
    template: '%s | ShopHub',
  },
  description: 'Discover thoughtfully selected tech, style and home essentials with fast delivery and easy returns.',
  keywords: ['e-commerce', 'online store', 'shopping', 'electronics', 'fashion', 'deals'],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'ShopHub — Better Finds, Beautifully Chosen',
    description: 'Thoughtfully selected tech, style and home essentials.',
    url: SITE_URL,
    siteName: 'ShopHub',
    type: 'website',
    images: [
      {
        url: '/images/home/editorial-collection.png',
        width: 1200,
        height: 630,
        alt: 'ShopHub Storefront',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopHub — Better Finds, Beautifully Chosen',
    description: 'Thoughtfully selected tech, style and home essentials.',
    images: ['/images/home/editorial-collection.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f4f1ea] text-[#11120f]">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
