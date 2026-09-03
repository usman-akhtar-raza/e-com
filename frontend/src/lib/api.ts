import { ApiResponse, PaginatedResponse, Product, Category, Brand, Cart, Order, Review, User, WishlistItem, Address, Coupon, CouponValidationResult } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API Error');
    }

    if (data && typeof data === 'object' && data.success === true && 'data' in data) {
      return data.data;
    }

    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.fetch<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  async patch<T>(endpoint: string, body: any): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

const client = new ApiClient();

export const api = {
  client,
  auth: {
    login: (body: any) => client.post<{accessToken: string}>('/auth/login', body),
    register: (body: any) => client.post<any>('/auth/register', body),
    getProfile: () => client.get<User>('/auth/profile'),
  },
  products: {
    getAll: (params?: any) => client.get<PaginatedResponse<Product>>('/products', params),
    getById: (id: string) => client.get<Product>(`/products/${id}`),
    getBySlug: (slug: string) => client.get<Product>(`/products/slug/${slug}`),
    create: (body: any) => client.post<Product>('/products', body),
    update: (id: string, body: any) => client.patch<Product>(`/products/${id}`, body),
    delete: (id: string) => client.delete<any>(`/products/${id}`),
  },
  categories: {
    getAll: () => client.get<Category[]>('/categories'),
    getById: (id: string) => client.get<Category>(`/categories/${id}`),
    getBySlug: (slug: string) => client.get<Category>(`/categories/slug/${slug}`),
  },
  brands: {
    getAll: (params?: any) => client.get<Brand[]>('/brands', params),
    getById: (id: string) => client.get<Brand>(`/brands/${id}`),
    getBySlug: (slug: string) => client.get<Brand>(`/brands/slug/${slug}`),
    create: (body: any) => client.post<Brand>('/brands', body),
    update: (id: string, body: any) => client.patch<Brand>(`/brands/${id}`, body),
    delete: (id: string) => client.delete<any>(`/brands/${id}`),
  },
  cart: {
    get: () => client.get<Cart>('/cart'),
    addItem: (productId: string, quantity: number = 1, variantId?: string) => client.post<Cart>('/cart/items', { productId, quantity, variantId }),
    updateItem: (id: string, quantity: number) => client.patch<Cart>(`/cart/items/${id}`, { quantity }),
    removeItem: (id: string) => client.delete<Cart>(`/cart/items/${id}`),
    clear: () => client.delete<void>('/cart'),
  },
  wishlist: {
    get: () => client.get<WishlistItem[]>('/wishlist'),
    checkStatus: (productId: string) => client.get<boolean>(`/wishlist/check/${productId}`),
    addItem: (productId: string) => client.post<WishlistItem>('/wishlist', { productId }),
    removeItem: (productId: string) => client.delete<void>(`/wishlist/${productId}`),
  },
  addresses: {
    getAll: () => client.get<Address[]>('/addresses'),
    getById: (id: string) => client.get<Address>(`/addresses/${id}`),
    create: (body: any) => client.post<Address>('/addresses', body),
    update: (id: string, body: any) => client.patch<Address>(`/addresses/${id}`, body),
    setDefault: (id: string) => client.patch<Address>(`/addresses/${id}/default`, {}),
    delete: (id: string) => client.delete<void>(`/addresses/${id}`),
  },
  coupons: {
    validate: (code: string, orderAmount: number) => client.post<CouponValidationResult>('/coupons/validate', { code, orderAmount }),
    getAll: () => client.get<Coupon[]>('/coupons'),
    getById: (id: string) => client.get<Coupon>(`/coupons/${id}`),
    create: (body: any) => client.post<Coupon>('/coupons', body),
    update: (id: string, body: any) => client.patch<Coupon>(`/coupons/${id}`, body),
    delete: (id: string) => client.delete<void>(`/coupons/${id}`),
  },
  orders: {
    create: (shippingAddress: any) => client.post<Order>('/orders', { shippingAddress }),
    getAll: () => client.get<Order[]>('/orders'),
    getById: (id: string) => client.get<Order>(`/orders/${id}`),
  },
  reviews: {
    getByProduct: (productId: string) => client.get<Review[]>(`/products/${productId}/reviews`),
    create: (body: any) => client.post<Review>('/reviews', body),
  }
};
