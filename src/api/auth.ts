import request from './request';
import type { ApiResponse } from '@/types';

export const authApi = {
  register: (data: any) => request.post<any, ApiResponse<any>>('/auth/register', data),
  login: (data: any) => request.post<any, { token: string, user: any }>('/auth/login', data),
};