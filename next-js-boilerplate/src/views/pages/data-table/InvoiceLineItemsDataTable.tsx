"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Typography } from "@/components/ui/Typography";
import {
  IconBuilding,
  IconCalendarEvent,
  IconUserCircle,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

interface InvoiceLineItem {
  nameKey: string;
  qty: number;
  unitPrice: number;
}

const INVOICE_ITEMS: InvoiceLineItem[] = [
  { nameKey: "dataTable25Item1", qty: 1, unitPrice: 42 },
  { nameKey: "dataTable25Item2", qty: 2, unitPrice: 24.5 },
  { nameKey: "dataTable25Item3", qty: 1, unitPrice: 120 },
  { nameKey: "dataTable25Item4", qty: 3, unitPrice: 12.4 },
  { nameKey: "dataTable25Item5", qty: 1, unitPrice: 78 },
];

const TAX_RATE = 0.2 as const;

function lineAmount(item: InvoiceLineItem): number {
  return item.qty * item.unitPrice;
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

export function InvoiceLineItemsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const subtotal = INVOICE_ITEMS.reduce(
    (sum, item) => sum + lineAmount(item),
    0,
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable25Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable25TabDescription}
          </Typography>
        </div>

        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b p-6">
            <div className="flex items-center gap-3">
              <div className="bg-brand/10 flex size-10 items-center justify-center rounded-lg">
                <IconBuilding size={20} className="text-brand" />
              </div>
              <div className="flex flex-col">
                <span className="text-muted text-xs tracking-wider uppercase">
                  {d.dataTable25InvoiceLabel}
                </span>
                <span className="text-fg text-lg font-semibold">
                  {d.dataTable25InvoiceNumber}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
              <div className="flex items-center gap-2.5">
                <IconCalendarEvent size={16} className="text-muted" />
                <div className="flex flex-col">
                  <span className="text-muted text-xs">
                    {d.dataTable25DateLabel}
                  </span>
                  <span className="text-sm font-medium">
                    {d.dataTable25Date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <IconUserCircle size={16} className="text-muted" />
                <div className="flex flex-col">
                  <span className="text-muted text-xs">
                    {d.dataTable25CustomerLabel}
                  </span>
                  <span className="text-sm font-medium">
                    {d.dataTable25Customer}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable25ColItem}</TableHead>
                <TableHead className="text-right">
                  {d.dataTable25ColQty}
                </TableHead>
                <TableHead className="text-right">
                  {d.dataTable25ColUnitPrice}
                </TableHead>
                <TableHead className="text-right">
                  {d.dataTable25ColAmount}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICE_ITEMS.map((item) => (
                <TableRow key={item.nameKey}>
                  <TableCell className="font-medium">
                    {d[item.nameKey]}
                  </TableCell>
                  <TableCell className="text-muted text-right">
                    {item.qty}
                  </TableCell>
                  <TableCell className="text-muted text-right">
                    {formatMoney(item.unitPrice, d.dataTable25Currency)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatMoney(lineAmount(item), d.dataTable25Currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-muted">
                  {d.dataTable25Subtotal}
                </TableCell>
                <TableCell className="text-right">
                  {formatMoney(subtotal, d.dataTable25Currency)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-muted">
                  {d.dataTable25Tax}
                </TableCell>
                <TableCell className="text-right">
                  {formatMoney(tax, d.dataTable25Currency)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-base font-semibold">
                  {d.dataTable25Total}
                </TableCell>
                <TableCell className="text-right text-base font-semibold">
                  {formatMoney(total, d.dataTable25Currency)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </section>
  );
}
