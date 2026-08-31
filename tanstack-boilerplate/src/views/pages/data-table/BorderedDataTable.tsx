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

const BORDERED_ROW_CLASS = "border border-border" as const;

interface BorderedInvoice {
  invoiceKey: string;
  statusKey: string;
  tone: InvoiceTone;
  methodKey: string;
  amountKey: string;
}

const BORDERED_INVOICES: BorderedInvoice[] = [
  {
    invoiceKey: "dataTable2Inv1",
    statusKey: "dataTable2StatusPaid",
    tone: "success",
    methodKey: "dataTable2Method1",
    amountKey: "dataTable2Amount1",
  },
  {
    invoiceKey: "dataTable2Inv2",
    statusKey: "dataTable2StatusUnpaid",
    tone: "error",
    methodKey: "dataTable2Method2",
    amountKey: "dataTable2Amount2",
  },
  {
    invoiceKey: "dataTable2Inv3",
    statusKey: "dataTable2StatusPaid",
    tone: "success",
    methodKey: "dataTable2Method3",
    amountKey: "dataTable2Amount3",
  },
  {
    invoiceKey: "dataTable2Inv4",
    statusKey: "dataTable2StatusPending",
    tone: "warning",
    methodKey: "dataTable2Method4",
    amountKey: "dataTable2Amount4",
  },
  {
    invoiceKey: "dataTable2Inv5",
    statusKey: "dataTable2StatusUnpaid",
    tone: "error",
    methodKey: "dataTable2Method5",
    amountKey: "dataTable2Amount5",
  },
  {
    invoiceKey: "dataTable2Inv6",
    statusKey: "dataTable2StatusPaid",
    tone: "success",
    methodKey: "dataTable2Method6",
    amountKey: "dataTable2Amount6",
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

export function BorderedDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable2Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable2Description}</p>
        </div>
        <div className="bg-surface border-border w-full rounded-xl border shadow-xs">
          <Table>
            <TableCaption>{d.dataTable2Caption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">
                  {d.dataTable2ColInvoice}
                </TableHead>
                <TableHead>{d.dataTable2ColStatus}</TableHead>
                <TableHead>{d.dataTable2ColMethod}</TableHead>
                <TableHead className="text-right">
                  {d.dataTable2ColAmount}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BORDERED_INVOICES.map((invoice) => (
                <TableRow
                  key={invoice.invoiceKey}
                  className={BORDERED_ROW_CLASS}
                >
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
