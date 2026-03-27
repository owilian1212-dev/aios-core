// ============================================================================
// Empresa Service — CRUD para gestão de empresas/clientes
// ============================================================================

import apiClient from './api.client';
import type { Empresa } from '@/lib/types';

interface ListEmpresasParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface ListEmpresasResponse {
  data: Empresa[];
  total: number;
  page: number;
  limit: number;
}

export const empresaService = {
  /**
   * Listar empresas com filtros opcionais
   * GET /empresas?page=1&limit=10&status=ativo
   */
  async listEmpresas(params?: ListEmpresasParams): Promise<ListEmpresasResponse> {
    try {
      const response = await apiClient.get<ListEmpresasResponse>('/empresas', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.status && { status: params.status }),
          ...(params?.search && { search: params.search }),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list empresas:', error);
      throw error;
    }
  },

  /**
   * Obter uma empresa por ID
   * GET /empresas/{id}
   */
  async getEmpresa(id: string): Promise<Empresa> {
    try {
      const response = await apiClient.get<Empresa>(`/empresas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch empresa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Atualizar uma empresa
   * PATCH /empresas/{id}
   */
  async updateEmpresa(id: string, data: Partial<Empresa>): Promise<Empresa> {
    try {
      const response = await apiClient.patch<Empresa>(`/empresas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update empresa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletar uma empresa
   * DELETE /empresas/{id}
   */
  async deleteEmpresa(id: string): Promise<void> {
    try {
      await apiClient.delete(`/empresas/${id}`);
    } catch (error) {
      console.error(`Failed to delete empresa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Criar uma nova empresa
   * POST /empresas
   */
  async createEmpresa(data: Partial<Empresa>): Promise<Empresa> {
    try {
      const response = await apiClient.post<Empresa>('/empresas', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create empresa:', error);
      throw error;
    }
  },

  /**
   * Obter estatísticas de uma empresa
   * GET /empresas/{id}/stats
   */
  async getEmpresaStats(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/empresas/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stats for empresa ${id}:`, error);
      throw error;
    }
  },
};
