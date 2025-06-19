import type { Dataset } from "@/models/dataset.ts";
import { type ColumnDef } from "@tanstack/react-table";

export const broadcastsColumns: ColumnDef<Dataset>[] = [
  {
    id: "ID",
    accessorKey: "id",
    header: "ID",
    enableHiding: false,
  },
  {
    id: "Nome",
    accessorFn: (row) => row.name,
    header: "Nome",
    cell: ({ getValue }) => getValue() || "-",
  },
];
