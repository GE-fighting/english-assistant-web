import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 这里可以添加token等认证信息
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export default apiClient;
