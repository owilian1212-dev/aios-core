// ============================================================================
// API Client — Axios instance com interceptors para JWT e error handling
// ============================================================================

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Interceptor: Request — Adicionar JWT automático nos headers
// ============================================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// Interceptor: Response — Tratar erros (401 → logout, etc)
// ============================================================================
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.warn('Unauthorized (401) — clearing session and redirecting to login');
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Acesso proibido
      console.error('Forbidden (403) — user lacks permissions');
    } else if (error.response?.status === 500) {
      // Erro no servidor
      console.error('Server error (500)', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
