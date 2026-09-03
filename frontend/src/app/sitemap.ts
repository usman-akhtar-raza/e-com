import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [prodRes, catRes] = await Promise.all([
      fetch(`${API_URL}/products?limit=100`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${API_URL}/categories`).then(r => r.json()).catch(() => []),
    ]);

    products = prodRes?.data || prodRes || [];
    categories = Array.isArray(catRes) ? catRes : (catRes?.data || []);
  } catch (err) {
    console.error('Failed to generate dynamic sitemap entries:', err);
  }

  const staticRoutes = ['', '/products', '/categories', '/cart', '/login', '/register'].map(route => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((p: any) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categoryRoutes = categories.map((c: any) => ({
    url: `${SITE_URL}/products?categoryId=${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
