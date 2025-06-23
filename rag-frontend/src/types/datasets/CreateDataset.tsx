export type CreateDataset = {
    name: string;
    description: string;
    organization_id: number;
}

export type CreateDatasetResponse = {
    id: number;
    name: string;
    hash: string;
    description: string;
    organization_id: number;
}