import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:8081';
let API_URL = String(import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).trim() || DEFAULT_API_URL;

if (!API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')?.trim();
  
  if (token && token !== 'undefined' && token !== 'null' && token.includes('.') && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      (axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message) ||
      (error instanceof Error ? error.message : null) ||
      'Error desconocido en el servidor';

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: axios.isAxiosError(error) ? error.config?.url : undefined,
        status: axios.isAxiosError(error) ? error.response?.status : undefined,
        message: errorMessage,
      });
    }

    return Promise.reject(error);
  }
);

export { API_URL };
export default api;