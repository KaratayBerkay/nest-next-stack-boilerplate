"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/Table";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Admin Users",
    description: "Table with caption, column scopes, and hover rows.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Table>
            <TableCaption>Recent transactions</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Alice</TableCell>
                <TableCell>$100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bob</TableCell>
                <TableCell>$50</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Row Selection",
    description: "Table with checkbox column driving selected state.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function TablePage() {
  return (
    <ExampleTabs
      title="Table"
      intro="A data table component."
      examples={examples}
    />
  );
}
