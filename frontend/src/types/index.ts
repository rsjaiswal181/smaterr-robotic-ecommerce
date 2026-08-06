export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image?: string;
  banner?: string;
  description?: string;
  children?: Category[];
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: Category | string;
  subCategory?: Category | string | null;
  brand?: Brand | string | null;
  images: string[];
  video?: string;
  description: string;
  specifications: { key: string; value: string }[];
  price: number;
  salePrice?: number;
  stock: number;
  minOrderQty: number;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: 'active' | 'inactive' | 'draft';
  ratingsAverage: number;
  ratingsCount: number;
  soldCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  coupon?: { code: string; discountType: 'percentage' | 'flat'; discountValue: number } | null;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Address[];
  wishlist: string[];
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'cod' | 'razorpay' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discount: number;
  couponCode?: string;
  totalPrice: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; date: string; note?: string }[];
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  requestType: 'product' | 'project' | 'consulting';
  name: string;
  phone: string;
  email?: string;
  company?: string;
  subject: string;
  budget?: string;
  details: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  adminNote?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}
