// src/api/request.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import type { ApiResponse } from '@/types';

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 💡 只有在函数执行时才获取 store
    const authStore = useAuthStore(); 
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<any>;
    if (!res.success) {
      // 可以在这里处理 401 未授权自动跳转登录
      if (response.status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.error || 'API Error'));
    }
    return res.data;
  },
  (error) => {
    console.error('🔥 Network Error:', error);
    return Promise.reject(error);
  }
);

export default service;