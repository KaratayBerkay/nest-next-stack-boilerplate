"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

type InvoiceTone = "success" | "warning" | "error";

const PILL_TONES: Record<InvoiceTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

interface BasicInvoice {
  invoiceKey: string;
  statusKey: string;
  tone: InvoiceTone;
  methodKey: string;
  amountKey: string;
}

const BASIC_INVOICES: BasicInvoice[] = [
  {
    invoiceKey: "dataTable1Inv1",
    statusKey: "dataTable1StatusPaid",
    tone: "success",
    methodKey: "dataTable1Method1",
    amountKey: "dataTable1Amount1",
  },
  {
    invoiceKey: "dataTable1Inv2",
    statusKey: "dataTable1StatusPending",
    tone: "warning",
    methodKey: "dataTable1Method2",
    amountKey: "dataTable1Amount2",
  },
  {
    invoiceKey: "dataTable1Inv3",
    statusKey: "dataTable1StatusUnpaid",
    tone: "error",
    methodKey: "dataTable1Method3",
    amountKey: "dataTable1Amount3",
  },
  {
    invoiceKey: "dataTable1Inv4",
    statusKey: "dataTable1StatusPaid",
    tone: "success",
    methodKey: "dataTable1Method4",
    amountKey: "dataTable1Amount4",
  },
  {
    invoiceKey: "dataTable1Inv5",
    statusKey: "dataTable1StatusPending",
    tone: "warning",
    methodKey: "dataTable1Method5",
    amountKey: "dataTable1Amount5",
  },
  {
    invoiceKey: "dataTable1Inv6",
    statusKey: "dataTable1StatusPaid",
    tone: "success",
    methodKey: "dataTable1Method6",
    amountKey: "dataTable1Amount6",
  },
];

function StatusPill({ label, tone }: { label: string; tone: InvoiceTone }) {
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

export function BasicDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable1Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable1Description}</p>
        </div>
        <div className="bg-surface border-border w-full rounded-xl border shadow-xs">
          <Table>
            <TableCaption>{d.dataTable1Caption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">
                  {d.dataTable1ColInvoice}
                </TableHead>
                <TableHead>{d.dataTable1ColStatus}</TableHead>
                <TableHead>{d.dataTable1ColMethod}</TableHead>
                <TableHead className="text-right">
                  {d.dataTable1ColAmount}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BASIC_INVOICES.map((invoice) => (
                <TableRow key={invoice.invoiceKey}>
                  <TableCell className="font-medium">
                    {d[invoice.invoiceKey]}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      label={d[invoice.statusKey]}
                      tone={invoice.tone}
                    />
                  </TableCell>
                  <TableCell className="text-muted">
                    {d[invoice.methodKey]}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {d[invoice.amountKey]}
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
