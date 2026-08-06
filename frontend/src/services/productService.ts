import { api } from './api';
import type { ApiResponse, Product } from '@/types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'popular' | 'priceLowToHigh' | 'priceHighToLow' | 'rating';
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}

export const productService = {
  list: (filters: ProductFilters = {}) =>
    api.get<ApiResponse<Product[]>>('/products', { params: filters }).then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<{ product: Product; related: Product[] }>>(`/products/slug/${slug}`).then((r) => r.data.data),

  searchSuggestions: (q: string) =>
    api.get<ApiResponse<Product[]>>('/products/search/suggestions', { params: { q } }).then((r) => r.data.data),

  // Admin
  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`).then((r) => r.data.data),
  create: (data: Partial<Product>) => api.post<ApiResponse<Product>>('/products', data).then((r) => r.data.data),
  update: (id: string, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data).then((r) => r.data.data),
  remove: (id: string) => api.delete(`/products/${id}`),
  bulkRemove: (ids: string[]) => api.post('/products/bulk-delete', { ids }),
};
