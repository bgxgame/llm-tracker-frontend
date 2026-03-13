// src/api/request.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import router from '@/router'; // 💡 必须直接引入 router 实例

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
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
    // 处理后端返回的业务错误 (success: false)
    const res = response.data;
    if (res.success === false) {
      return Promise.reject(new Error(res.error || 'API Error'));
    }
    return res.data;
  },
  (error) => {
    // 💡 重点：处理网络层错误 (如 401, 404, 500)
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn('🚨 [Security] 身份验证失效，正在强制跳转登录页');
        const authStore = useAuthStore();
        authStore.logout(); // 清理 Pinia 和 LocalStorage

        // 💡 自动跳转到登录页，并带上当前路由以便登录后跳回
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
      }

      const errorMsg = error.response.data?.error || '网络服务异常';
      return Promise.reject(new Error(errorMsg));
    }

    console.error('🔥 [Network Error]:', error.message);
    return Promise.reject(error);
  }
);

export default service;