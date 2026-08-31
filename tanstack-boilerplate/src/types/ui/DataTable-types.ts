import type { ColumnDef } from "@tanstack/react-table";

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: string;
}
