import { useDatasets } from "@/api/DatasetsApi";
import { datasetColumns } from "@/components/table/DatasetsTableColumns";
import { GenericTable } from "@/components/table/GenericTable";
import type { Dataset } from "@/types/datasets/Dataset";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pencil, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { MutateDatasetDialog } from "./MutateDatasetDialog";
import { useState } from "react";
import { DeleteDatasetAlert } from "./DeleteDatasetAlert";

export default function DatasetsPage() {
  const { data, isLoading, error, refetch, isFetching } = useDatasets();
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const handleRowClick = (row: Dataset) => {
    // navegar para a página de detalhes do dataset
    console.log("Row clicked:", row);
    // Aqui você pode usar o roteamento para navegar para a página de detalhes do dataset
    // Por exemplo, usando tanstack-router
    navigate({
      to: `/dataset/${row.id}/documents`,
      params: { datasetId: row.id.toString() },
    });
  };

  // Atualiza o dataset selecionado ao selecionar/desselecionar linhas na tabela
  const handleSelectionChange = (selectedRows: Dataset[]) => {
    setSelectedDataset(selectedRows.length === 1 ? selectedRows[0] : null);
  };

  if (error) {
    return <div>Erro ao carregar datasets: {error.message}</div>;
  }

  console.log("Datasets data:", data);
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-8">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Datasets disponíveis
                </h2>
              </div>
              <div className="flex gap-4 ml-auto mt-4 sm:mt-0">
                {/* Botão para atualizar records */}
                <Button
                  onClick={() => refetch()}
                  disabled={!data?.data || data?.data.length === 0}
                  variant="outline"
                  className="rounded-full h-9 w-9 flex items-center justify-center"
                  title="Atualizar"
                >
                  <RefreshCw className="w-8 h-8" />
                </Button>
                <DeleteDatasetAlert
                  trigger={
                    <Button
                      variant="outline"
                      disabled={!selectedDataset} // desabilita se não houver dataset selecionado
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  }
                  dataset={selectedDataset}
                  onSuccess={() => setSelectedDataset(null)}
                />
                <MutateDatasetDialog
                  dataset={selectedDataset ?? undefined}
                  trigger={
                    <Button variant="outline" disabled={!selectedDataset}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  }
                  onSuccess={() => setSelectedDataset(null)}
                />
                {/* Botão para criar novo dataset */}
                <MutateDatasetDialog
                  trigger={
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Criar Dataset
                    </Button>
                  }
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenericTable
              columns={datasetColumns(handleRowClick)}
              data={data?.data ?? []}
              isLoading={isFetching || isLoading}
              handleRowClick={handleRowClick}
              handleSelectionChange={handleSelectionChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
