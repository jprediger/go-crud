import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Dataset } from "../types/datasets/Dataset";
import {
  type CreateDataset,
  type CreateDatasetResponse,
} from "@/types/datasets/CreateDataset";
import type { ApiResponse } from "@/types/api/ApiResponse";
import type { UpdateDatasetResponse, UpdateDataset } from "@/types/datasets/UpdateDataset";

const backend_url = import.meta.env.VITE_BACKEND_URL;

// Função para buscar todos os datasets
export function useDatasets() {
  return useQuery<ApiResponse<Dataset[]>>({
    queryKey: ["datasets"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos
      const res = await fetch(`${backend_url}/datasets`);
      if (!res.ok) throw new Error("Erro ao buscar datasets");
      return res.json() as Promise<ApiResponse<Dataset[]>>;
    },
  });
}

// Criar um novo dataset
export function useCreateDataset() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<CreateDatasetResponse>, Error, CreateDataset>({
    mutationFn: async (novoDataset) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos

      const res = await fetch(`${backend_url}/datasets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoDataset),
      });
      if (!res.ok) throw new Error("Erro ao criar dataset");
      return res.json() as Promise<ApiResponse<CreateDatasetResponse>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}

// Atualizar um dataset existente
export function useUpdateDataset() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<UpdateDatasetResponse>, Error, UpdateDataset>({
    mutationFn: async (datasetAtualizado) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos
      const { id, ...body } = datasetAtualizado;

      const res = await fetch(`${backend_url}/datasets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao atualizar dataset");
      return res.json() as Promise<ApiResponse<UpdateDatasetResponse>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}

// Deletar um dataset existente
export function useDeleteDataset() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 1 segundo
      const res = await fetch(`${backend_url}/datasets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar dataset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}
