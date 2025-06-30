

export type Datasource = {
  id: number;
  name: string;
  dataset_id: number;
  type: string;
  object_key: string; // Caminho do arquivo no S3
  summary?: string | null; // Resumo do conteúdo, opcional
  created_at?: string; // Data de criação no formato "dd-mm-yyyy hh:mm:ss"
};

export type CreateDatasource = Omit<Datasource, "id" | "summary">;