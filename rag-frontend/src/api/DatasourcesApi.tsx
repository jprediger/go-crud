import { type ApiResponse } from "@/types/api/ApiResponse";
import type {
  CreateDatasource,
  Datasource,
} from "@/types/datasources/Datasource";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Hook para criar DataSource com React Querys
export function useCreateDataSource() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Datasource>, Error, CreateDatasource>({
    mutationFn: async (newDatasource) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos

      const res = await fetch(`${API_URL}/datasources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDatasource),
      });
      if (!res.ok) throw new Error("Erro ao criar DataSource");
      return res.json() as Promise<ApiResponse<Datasource>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasources"] });
    },
  });
}

// Hook para deletar DataSource com React Querys
export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Datasource>, Error, number>({
    mutationFn: async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos

      const res = await fetch(`${API_URL}/datasources/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir DataSource");
      return res.json() as Promise<ApiResponse<Datasource>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasources"] });
    },
  });
}

// Função para buscar DataSources
async function fetchDatasources(
  dataset_id?: number
): Promise<ApiResponse<Datasource[]>> {
  let url = `${API_URL}/datasources`;
  if (dataset_id !== undefined) {
    url += `?dataset_id=${dataset_id}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar DataSources");
  return res.json();
}

// Hook para listar DataSources com React Query
export function useDatasources(dataset_id?: number) {
  return useQuery<ApiResponse<Datasource[]>, Error>({
    queryKey: ["datasources"],
    queryFn: () => fetchDatasources(dataset_id),
  });
}
