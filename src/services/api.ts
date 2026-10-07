import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@taskman:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('@taskman:token');
      localStorage.removeItem('@taskman:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

