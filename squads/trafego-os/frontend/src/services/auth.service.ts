// ============================================================================
// Auth Service — Métodos para autenticação com API backend
// ============================================================================

import apiClient from './api.client';
import type { User } from '@/lib/types';

interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

interface RefreshResponse {
  token: string;
  expiresIn: number;
}

export const authService = {
  /**
   * Fazer login com email e senha
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Fazer logout — limpar tokens e fazer logout no backend
   * POST /auth/logout (opcional)
   */
  async logout(): Promise<void> {
    try {
      // Tentar fazer logout no backend
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout failed, continuing with local logout:', error);
    } finally {
      // Sempre limpar tokens localmente
      sessionStorage.clear();
      localStorage.clear();
    }
  },

  /**
   * Atualizar token JWT
   * POST /auth/refresh
   */
  async refreshToken(): Promise<RefreshResponse> {
    try {
      const response = await apiClient.post<RefreshResponse>('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  /**
   * Obter dados do usuário logado
   * GET /auth/me
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  },

  /**
   * Validar se um token ainda é válido
   */
  isTokenValid(): boolean {
    const token = sessionStorage.getItem('auth_token');
    if (!token) return false;

    try {
      // Decodificar JWT e verificar expiração
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      return payload.exp > now;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  /**
   * Obter token do storage
   */
  getToken(): string | null {
    return sessionStorage.getItem('auth_token');
  },

  /**
   * Salvar token no storage
   */
  setToken(token: string): void {
    sessionStorage.setItem('auth_token', token);
  },
};
