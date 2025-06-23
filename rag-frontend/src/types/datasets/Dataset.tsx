// Datasets Model
import type { Organization } from "../Organization";

export type Dataset = {
  id: number;
  name: string;
  hash: string;
  description?: string;
  organization: Organization;
}
