import { api } from './api';
import type { ApiResponse, Category, Brand, Cart, Order, Coupon, Review, User, Inquiry } from '@/types';

export { productService } from './productService';
export type { ProductFilters } from './productService';

export const categoryService = {
  list: (tree = false) => api.get<ApiResponse<Category[]>>('/categories', { params: { tree } }).then((r) => r.data.data),
  getBySlug: (slug: string) => api.get<ApiResponse<Category>>(`/categories/${slug}`).then((r) => r.data.data),
  create: (data: Partial<Category>) => api.post<ApiResponse<Category>>('/categories', data).then((r) => r.data.data),
  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export const brandService = {
  list: () => api.get<ApiResponse<Brand[]>>('/brands').then((r) => r.data.data),
  create: (data: Partial<Brand>) => api.post<ApiResponse<Brand>>('/brands', data).then((r) => r.data.data),
  update: (id: string, data: Partial<Brand>) =>
    api.put<ApiResponse<Brand>>(`/brands/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/brands/${id}`),
};

export const cartService = {
  get: () => api.get<ApiResponse<Cart>>('/cart').then((r) => r.data.data),
  add: (productId: string, quantity = 1) =>
    api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity }).then((r) => r.data.data),
  update: (productId: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity }).then((r) => r.data.data),
  remove: (productId: string) => api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`).then((r) => r.data.data),
  clear: () => api.delete<ApiResponse<Cart>>('/cart').then((r) => r.data.data),
  applyCoupon: (code: string) => api.post<ApiResponse<Cart>>('/cart/coupon', { code }).then((r) => r.data.data),
};

export const orderService = {
  place: (data: { shippingAddress: unknown; paymentMethod: string }) =>
    api.post<ApiResponse<Order>>('/orders', data).then((r) => r.data.data),
  myOrders: () => api.get<ApiResponse<Order[]>>('/orders/my-orders').then((r) => r.data.data),
  getById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data.data),
  cancel: (id: string) => api.put<ApiResponse<Order>>(`/orders/${id}/cancel`).then((r) => r.data.data),

  // Admin
  all: (params: { status?: string; page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<Order[]>>('/orders', { params }).then((r) => r.data),
  updateStatus: (id: string, status: string, note?: string) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status, note }).then((r) => r.data.data),
};

export const couponService = {
  list: () => api.get<ApiResponse<Coupon[]>>('/coupons').then((r) => r.data.data),
  create: (data: Partial<Coupon>) => api.post<ApiResponse<Coupon>>('/coupons', data).then((r) => r.data.data),
  update: (id: string, data: Partial<Coupon>) =>
    api.put<ApiResponse<Coupon>>(`/coupons/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/coupons/${id}`),
};

export const reviewService = {
  listForProduct: (productId: string) =>
    api.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`).then((r) => r.data.data),
  create: (productId: string, data: { rating: number; title?: string; comment: string }) =>
    api.post<ApiResponse<Review>>(`/reviews/product/${productId}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/reviews/${id}`),
};

export const userService = {
  updateProfile: (data: { name: string; phone?: string }) =>
    api.put<ApiResponse<User>>('/users/profile', data).then((r) => r.data.data),
  addAddress: (data: unknown) => api.post('/users/addresses', data).then((r) => r.data.data),
  updateAddress: (addressId: string, data: unknown) =>
    api.put(`/users/addresses/${addressId}`, data).then((r) => r.data.data),
  removeAddress: (addressId: string) => api.delete(`/users/addresses/${addressId}`).then((r) => r.data.data),
  getWishlist: () => api.get<ApiResponse<unknown[]>>('/users/wishlist').then((r) => r.data.data),
  toggleWishlist: (productId: string) =>
    api.post<ApiResponse<string[]>>('/users/wishlist', { productId }).then((r) => r.data.data),

  // Admin
  all: (params: { page?: number; limit?: number; search?: string } = {}) =>
    api.get<ApiResponse<User[]>>('/users', { params }).then((r) => r.data),
  toggleStatus: (id: string) => api.put<ApiResponse<User>>(`/users/${id}/toggle-status`).then((r) => r.data.data),
};

export const uploadService = {
  single: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post<ApiResponse<{ url: string }>>('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },
  multiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api
      .post<ApiResponse<{ url: string }[]>>('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },
};

export const inquiryService = {
  create: (data: Partial<Inquiry>) =>
    api.post<ApiResponse<Inquiry>>('/inquiries', data).then((r) => r.data.data),
  list: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    api.get<ApiResponse<Inquiry[]>>('/inquiries', { params }).then((r) => r.data),
  update: (id: string, data: Pick<Partial<Inquiry>, 'status' | 'adminNote'>) =>
    api.put<ApiResponse<Inquiry>>(`/inquiries/${id}`, data).then((r) => r.data.data),
};

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalInquiries: number;
  openInquiries: number;
  totalRevenue: number;
  lowStock: { _id: string; name: string; stock: number; sku: string }[];
  recentOrders: Order[];
  topProducts: { _id: string; name: string; soldCount: number; images: string[] }[];
  dailySales: { _id: string; revenue: number; orders: number }[];
  orderStatusBreakdown: { _id: string; count: number }[];
}

export const dashboardService = {
  stats: () => api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats').then((r) => r.data.data),
};
