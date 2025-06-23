import type { Dataset } from "@/types/datasets/Dataset";
import { type ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

export function datasetColumns(
  handleRowClick?: (row: Dataset) => void
): ColumnDef<Dataset>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "ID",
      accessorKey: "id",
      filterFn: (row, columnId, filterValue) => {
        // Converte o valor da linha (que é um número) para string
        const rowValue = String(row.getValue(columnId));
        const filter = String(filterValue);
        return rowValue.includes(filter);
      },
      header: "ID",
      enableHiding: false,
    },
    {
      id: "Nome",
      accessorFn: (row) => row.name,
      header: "Nome",
      cell: ({ row }) => (
        <span
          className="text-primary cursor-pointer underline"
          onClick={() => handleRowClick && handleRowClick(row.original)}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      id: "Organização",
      accessorFn: (row) => row.organization?.name || "N/A",
      header: "Organização",
      cell: ({ getValue }) => getValue() || "-",
    },
  ];
}
