import type { Datasource } from "@/types/datasources/Datasource";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export function datasourceColumns(
  handleRowClick?: (row: Datasource) => void
): ColumnDef<Datasource>[] {
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
      header: "ID",
      enableHiding: false,
      filterFn: (row, columnId, filterValue) => {
        const rowValue = String(row.getValue(columnId));
        const filter = String(filterValue);
        return rowValue.includes(filter);
      },
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
      id: "Tipo",
      accessorFn: (row) => row.type,
      header: "Tipo",
      cell: ({ getValue }) => getValue() || "-",
    },
    {
      id: "Criação",
      accessorFn: (row) => row.created_at,
      header: "Criação",
      cell: ({ getValue }) => getValue() || "-",
      filterFn: (row, columnId, filterValue) => {
        const rowValue = String(row.getValue(columnId));
        const filter = String(filterValue);
        return rowValue.includes(filter);
      },
      sortingFn: (rowA, rowB, columnId) => {
        // dd-mm-yyyy hh:mm:ss para Date
        const parse = (v: string) => {
          if (!v) return 0;
          const [date, time] = v.split(" ");
          const [d, m, y] = date.split("-").map(Number);
          const [h = 0, min = 0, s = 0] = (time || "00:00:00")
            .split(":")
            .map(Number);
          return new Date(y, m - 1, d, h, min, s).getTime();
        };
        const a = parse(rowA.getValue(columnId) as string);
        const b = parse(rowB.getValue(columnId) as string);
        return a - b;
      },
    },
    {
      id: "Resumo",
      accessorKey: "summary",
      header: "Resumo",
      cell: ({ getValue }) => getValue() || "-",
    },
  ];
}
