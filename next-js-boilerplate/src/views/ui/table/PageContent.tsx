"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from "@/components/ui/Table";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const invoiceLineItems = [
  { item: "Wireless Keyboard", qty: 2, price: 79.0 },
  { item: "USB-C Hub", qty: 1, price: 45.0 },
  { item: "Monitor Arm", qty: 1, price: 129.0 },
];

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Table Examples",
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
    id: "invoice",
    title: "Invoice",
    description: "Invoice #INV-2024-001 — itemized billing table.",
    render: () => {
      const subtotal = invoiceLineItems.reduce((sum, line) => sum + line.price * line.qty, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      return (
        <Table>
          <TableCaption>Invoice #INV-2024-001</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceLineItems.map((line) => (
              <TableRow key={line.item}>
                <TableCell>{line.item}</TableCell>
                <TableCell className="text-right tabular-nums">{line.qty}</TableCell>
                <TableCell className="text-right tabular-nums">${line.price.toFixed(2)}</TableCell>
                <TableCell className="text-right tabular-nums">${(line.price * line.qty).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
              <TableCell className="text-right tabular-nums">${subtotal.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">Tax (8%)</TableCell>
              <TableCell className="text-right tabular-nums">${tax.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
              <TableCell className="text-right tabular-nums font-bold">${total.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
    },
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Table component across all theme variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "secondary", "outline"]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <div className={`flex items-center gap-2 text-${size === "sm" ? "xs" : size === "lg" ? "base" : "sm"}`}>
            <span className="font-medium">{variant}</span>
            <span className="text-muted">{size}</span>
          </div>
        )}
      />
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
