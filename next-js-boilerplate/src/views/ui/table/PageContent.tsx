"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { InvoicesBasicTable, SelectedRowTable } from "./TableDemos";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic Table",
    description: "Headers, rows, footer, and caption.",
    render: () => <InvoicesBasicTable />,
    code: `import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption,
} from "@/components/ui/Table";

<Table>
  <TableCaption>A list of invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>Total</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`,
  },
  {
    id: "selected-row",
    title: "Selected Row",
    description: "Highlight a selected row.",
    render: () => <SelectedRowTable />,
  },
];

export default function TablePage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Table"
      intro="Data table with headers, rows, footer, and caption."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
