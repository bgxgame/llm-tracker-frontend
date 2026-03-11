import axios from 'axios';
import type { ApiResponse } from '@/types';

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<any>;
    
    // 如果 success 为 false，则抛出错误
    if (!res.success) {
      const errorMsg = res.error || '未知错误';
      console.error('❌ API Error:', errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    return res.data; // 直接返回数据部分
  },
  (error) => {
    console.error('🔥 Network Error:', error);
    return Promise.reject(error);
  }
);

export default service;