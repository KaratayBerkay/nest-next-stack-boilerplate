"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

type StockTone = "success" | "warning" | "error";

const PILL_TONES: Record<StockTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

interface StripedProduct {
  productKey: string;
  categoryKey: string;
  priceKey: string;
  stockKey: string;
  statusKey: string;
  tone: StockTone;
}

const STRIPED_PRODUCTS: StripedProduct[] = [
  {
    productKey: "dataTable3Product1",
    categoryKey: "dataTable3Category1",
    priceKey: "dataTable3Price1",
    stockKey: "dataTable3Stock1",
    statusKey: "dataTable3StatusInStock",
    tone: "success",
  },
  {
    productKey: "dataTable3Product2",
    categoryKey: "dataTable3Category2",
    priceKey: "dataTable3Price2",
    stockKey: "dataTable3Stock2",
    statusKey: "dataTable3StatusInStock",
    tone: "success",
  },
  {
    productKey: "dataTable3Product3",
    categoryKey: "dataTable3Category3",
    priceKey: "dataTable3Price3",
    stockKey: "dataTable3Stock3",
    statusKey: "dataTable3StatusInStock",
    tone: "success",
  },
  {
    productKey: "dataTable3Product4",
    categoryKey: "dataTable3Category4",
    priceKey: "dataTable3Price4",
    stockKey: "dataTable3Stock4",
    statusKey: "dataTable3StatusOutOfStock",
    tone: "error",
  },
  {
    productKey: "dataTable3Product5",
    categoryKey: "dataTable3Category5",
    priceKey: "dataTable3Price5",
    stockKey: "dataTable3Stock5",
    statusKey: "dataTable3StatusInStock",
    tone: "success",
  },
  {
    productKey: "dataTable3Product6",
    categoryKey: "dataTable3Category6",
    priceKey: "dataTable3Price6",
    stockKey: "dataTable3Stock6",
    statusKey: "dataTable3StatusInStock",
    tone: "success",
  },
  {
    productKey: "dataTable3Product7",
    categoryKey: "dataTable3Category7",
    priceKey: "dataTable3Price7",
    stockKey: "dataTable3Stock7",
    statusKey: "dataTable3StatusLowStock",
    tone: "warning",
  },
  {
    productKey: "dataTable3Product8",
    categoryKey: "dataTable3Category8",
    priceKey: "dataTable3Price8",
    stockKey: "dataTable3Stock8",
    statusKey: "dataTable3StatusInStock",
    tone: "success",
  },
];

function StatusPill({ label, tone }: { label: string; tone: StockTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        PILL_TONES[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function StripedDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable3Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable3Description}</p>
        </div>
        <div className="bg-surface border-border w-full rounded-xl border shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable3ColProduct}</TableHead>
                <TableHead>{d.dataTable3ColCategory}</TableHead>
                <TableHead className="text-right">
                  {d.dataTable3ColPrice}
                </TableHead>
                <TableHead className="text-right">
                  {d.dataTable3ColStock}
                </TableHead>
                <TableHead>{d.dataTable3ColStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&>tr:nth-child(even)]:bg-surface-hover/40">
              {STRIPED_PRODUCTS.map((product) => (
                <TableRow key={product.productKey}>
                  <TableCell className="font-medium">
                    {d[product.productKey]}
                  </TableCell>
                  <TableCell className="text-muted">
                    {d[product.categoryKey]}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {d[product.priceKey]}
                  </TableCell>
                  <TableCell className="text-muted text-right">
                    {d[product.stockKey]}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      label={d[product.statusKey]}
                      tone={product.tone}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
