"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

interface Invoice {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

const invoices: Invoice[] = [
  {
    id: "INV001",
    customer: "Alice Johnson",
    email: "alice@example.com",
    amount: 250,
    status: "paid",
  },
  {
    id: "INV002",
    customer: "Bob Smith",
    email: "bob@example.com",
    amount: 150,
    status: "pending",
  },
  {
    id: "INV003",
    customer: "Carol White",
    email: "carol@example.com",
    amount: 350,
    status: "overdue",
  },
  {
    id: "INV004",
    customer: "David Brown",
    email: "david@example.com",
    amount: 450,
    status: "paid",
  },
  {
    id: "INV005",
    customer: "Eve Davis",
    email: "eve@example.com",
    amount: 550,
    status: "paid",
  },
  {
    id: "INV006",
    customer: "Frank Wilson",
    email: "frank@example.com",
    amount: 200,
    status: "pending",
  },
  {
    id: "INV007",
    customer: "Grace Lee",
    email: "grace@example.com",
    amount: 300,
    status: "paid",
  },
  {
    id: "INV008",
    customer: "Henry Taylor",
    email: "henry@example.com",
    amount: 175,
    status: "overdue",
  },
];

const statusVariant: Record<string, "success" | "warning" | "error"> = {
  paid: "success",
  pending: "warning",
  overdue: "error",
};

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: "id", header: "Invoice" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]} size="sm">
        {row.original.status}
      </Badge>
    ),
  },
];

function BasicDemo() {
  return <DataTable columns={columns} data={invoices} />;
}

function SearchableDemo() {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      searchKey="customer"
      searchPlaceholder="Search by customer..."
    />
  );
}

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic Table",
    description: "Sortable columns with click headers.",
    render: () => <BasicDemo />,
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
    render: () => <SearchableDemo />,
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
