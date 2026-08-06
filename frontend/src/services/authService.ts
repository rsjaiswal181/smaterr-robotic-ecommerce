import { api } from './api';
import type { ApiResponse, User } from '@/types';

interface AuthResult {
  user: User;
  accessToken: string;
}

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<AuthResult>>('/auth/register', data).then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResult>>('/auth/login', data).then((r) => r.data.data),

  adminLogin: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResult>>('/auth/admin/login', data).then((r) => r.data.data),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),

  getMe: () => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
};
