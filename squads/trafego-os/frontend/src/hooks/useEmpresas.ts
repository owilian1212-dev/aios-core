// ============================================================================
// useEmpresas Hook — React Query integration com empresa.service
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresaService } from "@/services";
import type { Empresa } from "@/lib/types";

interface UseEmpresasOptions {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Hook para listar empresas com React Query
 */
export function useEmpresas(options?: UseEmpresasOptions) {
  return useQuery({
    queryKey: ["empresas", options],
    queryFn: () =>
      empresaService.listEmpresas({
        page: options?.page || 1,
        limit: options?.limit || 10,
        status: options?.status,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obter uma empresa por ID
 */
export function useEmpresa(id?: string) {
  return useQuery({
    queryKey: ["empresa", id],
    queryFn: () => empresaService.getEmpresa(id!),
    enabled: !!id, // Só fazer query se id existir
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para atualizar uma empresa
 */
export function useUpdateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Empresa> }) =>
      empresaService.updateEmpresa(id, data),
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["empresa", data.id] });
    },
  });
}

/**
 * Hook para deletar uma empresa
 */
export function useDeleteEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresaService.deleteEmpresa(id),
    onSuccess: () => {
      // Invalidar lista de empresas
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
}

/**
 * Hook para criar uma empresa
 */
export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Empresa>) => empresaService.createEmpresa(data),
    onSuccess: () => {
      // Invalidar lista de empresas
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
}
