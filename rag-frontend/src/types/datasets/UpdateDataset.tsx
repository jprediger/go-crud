export type UpdateDataset = {
    id: number;
    name?: string;
    description?: string;
    organization_id?: number;
}

export type UpdateDatasetResponse = {
    id: number;
    name: string;
    hash: string;
    description: string;
    organization_id: number;
}