export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price?: number;
  compareAtPrice?: number;
  attributes?: Record<string, any>;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  stock: number;
  status?: ProductStatus;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  images?: string[];
  productImages?: ProductImage[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export type AddressType = 'SHIPPING' | 'BILLING' | 'HOME' | 'WORK';

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: AddressType;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expirationDate?: string;
  usageLimit?: number;
  userUsageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon;
  discountAmount: number;
  message?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variant?: ProductVariant;
  priceSnapshot?: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode?: string;
  postalCode?: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  price: number;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
