import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { AuthProvider } from '@/context/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ShopHub — Production-Ready E-Commerce Storefront',
    template: '%s | ShopHub',
  },
  description: 'Shop top quality tech, fashion, books, and home essentials with fast shipping and verified ratings.',
  keywords: ['e-commerce', 'online store', 'shopping', 'electronics', 'fashion', 'deals'],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'ShopHub — Premium E-Commerce Platform',
    description: 'Shop top quality tech, fashion, books, and home essentials.',
    url: SITE_URL,
    siteName: 'ShopHub',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
        width: 1200,
        height: 630,
        alt: 'ShopHub Storefront',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopHub — Premium E-Commerce Platform',
    description: 'Shop top quality tech, fashion, books, and home essentials.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
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
