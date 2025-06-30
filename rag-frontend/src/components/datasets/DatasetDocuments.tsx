import { useDatasets } from "@/api/DatasetsApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import { SiteHeader } from "../SiteHeader";
import { ScrollArea } from "../ui/scroll-area";

import { Progress } from "@/components/ui/progress";

import { generateUploadUrl, saveFileToS3 } from "@/api/UploadDocumentApi";

import { useCreateDataSource, useDatasources } from "@/api/DatasourcesApi";
import { FaRegFileAlt, FaRegFilePdf, FaRegFileWord } from "react-icons/fa";

import type { Datasource } from "@/types/datasources/Datasource";
import { toast } from "sonner";
import { datasourceColumns } from "../table/DatasourcesTableColumns";
import { GenericTable } from "../table/GenericTable";
import { DeleteDatasourceAlert } from "./DeleteDatasourceAlert";

type UploadedDocument = {
  name: string;
  file: File;
  size: number;
  type: string;
  lastModified: number;
  progress?: number; // 0-100
  status?: "pending" | "uploading" | "success" | "error";
};

export default function DatasetDocuments() {
  const createDataSource = useCreateDataSource();

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const { data: datasetsData } = useDatasets();

  // pegue do params
  const { datasetId } = useParams({ strict: false }) as { datasetId: string };
  const {
    data: datasourcesData,
    isFetching,
    isLoading,
    refetch,
  } = useDatasources(Number(datasetId));

  const [selectedDatasource, setSelectedDatasource] =
    useState<Datasource | null>(null);

  // Atualiza o datasource selecionado ao selecionar/desselecionar linhas na tabela
  const handleSelectionChange = (selectedRows: Datasource[]) => {
    setSelectedDatasource(selectedRows.length === 1 ? selectedRows[0] : null);
  };

  const [isLoadingUpload, setIsLoadingUpload] = useState(false);

  // Adiciona arquivos selecionados ou arrastados automaticamente à lista
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setDocuments((docs) => [
        ...docs,
        ...filesArray.map((file) => ({
          name: file.name,
          file,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
      ]);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = "";
    }
  };

  // Suporte a drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const filesArray = Array.from(event.dataTransfer.files);
      setDocuments((docs) => [
        ...docs,
        ...filesArray.map((file) => ({
          name: file.name,
          file,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
      ]);
    }
  };

  const handleUpload = async () => {
    if (documents && documents.length > 0) {
      setIsLoadingUpload(true);

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        console.log(`Enviando documento: ${doc.name}`);

        try {
          // Gera a URL de upload
          const uploadUrlResponse = await generateUploadUrl({
            fileName: doc.name,
            contentType: doc.file.type,
          });

          // Atualiza status para uploading
          setDocuments((docs) =>
            docs.map((d, idx) =>
              idx === i ? { ...d, status: "uploading", progress: 0 } : d
            )
          );

          // Upload com progresso
          await saveFileToS3(
            uploadUrlResponse.data.uploadURL,
            doc.file,
            (percent) => {
              setDocuments((docs) =>
                docs.map((d, idx) =>
                  idx === i ? { ...d, progress: percent } : d
                )
              );
            }
          );

          // Atualiza status para success
          setDocuments((docs) =>
            docs.map((d, idx) =>
              idx === i ? { ...d, status: "success", progress: 100 } : d
            )
          );

          createDataSource.mutate({
            name: doc.name,
            dataset_id: Number(datasetId),
            type: doc.type,
            object_key: uploadUrlResponse.data.objectKey, // Caminho do arquivo no S3
          });

          //remove o documento da lista
          setDocuments((docs) => docs.slice(1));

          console.log(`Documento ${doc.name} enviado com sucesso!`);
        } catch (error) {
          setDocuments((docs) =>
            docs.map((d, idx) => (idx === i ? { ...d, status: "error" } : d))
          );
          toast.error(`Erro ao enviar o documento ${doc.name}: ${error}`);
          console.error(`Erro ao enviar o documento ${doc.name}:`, error);
        }
        toast.success("Todos os documentos foram enviados com sucesso!");
      }
      setIsLoadingUpload(false);
      //setDocuments([]);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        datasets={datasetsData?.data ?? []}
        activeDatasetId={datasetId}
      />
      <SidebarInset>
        <SiteHeader title="Documentos" />

        <div className="flex flex-col container mx-auto py-6 gap-6">
          <div className="flex flex-row container mx-auto h-[400px] gap-6">
            <Card
              className={`flex flex-col transition-all ${
                documents.length > 0 ? "w-1/4" : "w-full"
              }`}
            >
              <CardHeader>
                <h2 className="text-xl font-semibold">Upload de documentos</h2>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center pr-6 pl-6 pb-0">
                <div className="flex w-full h-full items-center justify-center">
                  <label
                    htmlFor="dropzone-file"
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    className={`dark:hover:bg-bray-800 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600 ${
                      isDragging ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <UploadCloud className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">
                          Clique para enviar
                        </span>{" "}
                        ou arraste e solte
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, TXT
                      </p>
                    </div>
                    <Input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                      multiple
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
            {documents.length > 0 && (
              <Card className="w-3/4 flex flex-col">
                <CardHeader>
                  <h2 className="text-xl font-semibold">
                    Documentos Carregados
                  </h2>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0 overflow-hidden">
                  <ScrollArea className="h-full w-full">
                    <ul className="space-y-2">
                      {documents.map((doc, idx) => {
                        // Lógica para determinar o status (você implementaria isso no seu state)
                        const isUploading =
                          typeof doc.progress === "number" &&
                          doc.progress < 100;
                        const isComplete = doc.progress === 100; // ou um campo `doc.status === 'complete'`
                        const isError = doc.status === "error"; // Exemplo

                        let icon = (
                          <FaRegFileAlt className="w-4 h-4 mr-2 text-primary" />
                        );
                        if (doc.type === "application/pdf") {
                          icon = (
                            <FaRegFilePdf className="w-4 h-4 mr-2 text-red-600" />
                          );
                        } else if (doc.type.includes("word")) {
                          icon = (
                            <FaRegFileWord className="w-4 h-4 mr-2 text-blue-600" />
                          );
                        }

                        return (
                          <li
                            key={idx}
                            className="relative flex items-center justify-between rounded border px-3 py-2 overflow-hidden" // `relative` e `overflow-hidden` são cruciais
                          >
                            {/* Informações do Arquivo */}
                            <span className="flex items-center truncate z-10">
                              {icon}
                              {doc.name}
                              <span className="ml-2 text-xs text-gray-500">
                                {`${(doc.size / (1024 * 1024)).toFixed(2)} MB`}
                              </span>
                            </span>

                            {/* Barra de Progresso (no meio) */}
                            <span>
                              {isUploading && (
                                <Progress
                                  value={isUploading ? doc.progress : 100}
                                  className="w-48 h-2"
                                />
                              )}
                            </span>

                            {/* Botão de Ação Contextual (à direita) */}
                            <div className="flex items-center gap-2 z-10">
                              {isUploading && (
                                <span className="text-xs text-gray-500">{`${doc.progress}%`}</span>
                              )}

                              {isComplete && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              )}

                              {isError && (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isLoadingUpload && !isUploading} // Desabilita se outro upload estiver em andamento, mas permite cancelar o atual
                                className="ml-2"
                                aria-label={
                                  isUploading ? "Cancelar upload" : "Remover"
                                }
                                onClick={() => {
                                  if (isUploading) {
                                    // Lógica para cancelar o upload
                                    console.log(
                                      "Cancelando upload de:",
                                      doc.name
                                    );
                                  } else {
                                    // Lógica para remover o documento
                                    setDocuments((docs) =>
                                      docs.filter((_, i) => i !== idx)
                                    );
                                  }
                                }}
                              >
                                {isUploading ? (
                                  <XCircle className="w-4 h-4 text-orange-600" /> // Ícone de Cancelar
                                ) : (
                                  <X className="w-4 h-4 text-destructive" /> // Ícone de Remover
                                )}
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={documents.length === 0 || isLoadingUpload}
                    className="flex justify-end"
                    loading={isLoadingUpload}
                    loadingText={
                      documents.length > 1
                        ? "Enviando Documentos..."
                        : "Enviando Documento..."
                    }
                  >
                    {documents.length > 1
                      ? "Enviar Documentos"
                      : "Enviar Documento"}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
          <Card className="">
            {/* Removido CardHeader e CardTitle para evitar paddings automáticos */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 ">
              <div>
                <h2 className="text-xl font-semibold">Lista de documentos</h2>
              </div>

              <div className="flex gap-4 ml-auto mt-4 sm:mt-0">
                <Button
                  onClick={() => refetch()}
                  disabled={
                    !datasourcesData?.data || datasourcesData?.data.length === 0
                  }
                  variant="outline"
                  className="rounded-full h-9 w-9 flex items-center justify-center"
                  title="Atualizar"
                >
                  <RefreshCw className="w-8 h-8" />
                </Button>
                <DeleteDatasourceAlert
                  trigger={
                    <Button variant="outline" disabled={!selectedDatasource}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  }
                  datasource={selectedDatasource}
                  onSuccess={() => setSelectedDatasource(null)}
                />
              </div>
            </div>
            <CardContent className="px-6">
              <GenericTable
                columns={datasourceColumns()}
                data={datasourcesData?.data ?? []}
                isLoading={isFetching || isLoading}
                defaultSort={[{ id: "Criação", desc: true }]}
                handleSelectionChange={handleSelectionChange}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
