import request from './request';
import type { ApiResponse, User } from '@/types';

export const authApi = {
  register: (data: any) => request.post<any, ApiResponse<any>>('/auth/register', data),
  login: (data: any) => request.post<any, { token: string, user: User }>('/auth/login', data),
  // 💡 新增：同步用户信息
  getMe: () => request.get<any, User>('/auth/me'),
};