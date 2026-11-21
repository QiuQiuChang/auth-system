import axios from 'axios';
import { getMessageApi } from '../utils/messageHolder';

const client = axios.create({
  // 本地开发留空，走 vite.config.js 的 /api 代理；
  // 生产构建时由 VITE_API_BASE_URL 指向线上后端地址（Railway 域名）
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000, // 增加到 60 秒，适配 AI 接口响应时间
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const pageHandles = url.includes('/api/auth/login')
                     || url.includes('/api/tools/')
                     || url.includes('/api/payment');

    // 这些接口的错误交给页面自行处理，拦截器不弹提示
    if (pageHandles) {
      return Promise.reject(error);
    }

    // 非登录接口的 401：清除会话并跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      getMessageApi()?.error('登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 其他错误：提取后端返回的错误信息并提示
    const msg = error.response?.data?.message;
    if (msg) {
      getMessageApi()?.error(msg);
    }

    return Promise.reject(error);
  }
);

export default client;
