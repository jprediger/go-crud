import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "../sidebar/AppSidebar";
import { SiteHeader } from "../SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useDatasets } from "@/api/DatasetsApi";
import { useParams } from "@tanstack/react-router";

export default function DatasetChunks() {
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const { data } = useDatasets();
  const { datasetId } = useParams({ strict: false }) as { datasetId: string };

  // Exemplo de função para buscar ou processar chunks
  const handleLoadChunks = () => {
    setIsLoadingChunks(true);
    // Lógica para buscar/processar chunks aqui
    setTimeout(() => setIsLoadingChunks(false), 1000); // Simula carregamento
  };

  return (
    <SidebarProvider>
      <AppSidebar datasets={data?.data ?? []} activeDatasetId={datasetId} />
      <SidebarInset>
        <SiteHeader title="Chunks"/>
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Chunks do Dataset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <Button onClick={handleLoadChunks} disabled={isLoadingChunks}>
                  {isLoadingChunks ? "Carregando..." : "Carregar Chunks"}
                </Button>
                {/* Aqui você pode renderizar a lista de chunks do dataset */}
                <div className="mt-6 text-center text-muted-foreground">
                  Nenhum chunk carregado.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}