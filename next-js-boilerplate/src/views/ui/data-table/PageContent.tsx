"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { DataTableBasicDemo, DataTableSearchableDemo } from "./DataTableDemos";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic Table",
    description: "Sortable columns with click headers.",
    render: () => <DataTableBasicDemo />,
    code: `import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: "id", header: "Invoice" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "amount", header: "Amount" },
];

<DataTable columns={columns} data={invoices} />`,
  },
  {
    id: "searchable",
    title: "With Search",
    description: "Filterable with a search input.",
    render: () => <DataTableSearchableDemo />,
    code: `<DataTable
  columns={columns}
  data={invoices}
  searchKey="customer"
  searchPlaceholder="Search by customer..."
/>`,
  },
];

export default function DataTablePage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Data Table"
      intro="Sortable, filterable data table built on TanStack Table."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
