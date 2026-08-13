"use client";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

type TxTone = "success" | "warning" | "error";

const PILL_TONES: Record<TxTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
};

const STICKY_HEADER_CLASS = "bg-surface sticky top-0 z-10" as const;

interface StickyTransaction {
  txKey: string;
  dateKey: string;
  descKey: string;
  categoryKey: string;
  amountKey: string;
  statusKey: string;
  tone: TxTone;
}

const STICKY_TRANSACTIONS: StickyTransaction[] = [
  {
    txKey: "dataTable5Tx1",
    dateKey: "dataTable5Date1",
    descKey: "dataTable5Desc1",
    categoryKey: "dataTable5Category1",
    amountKey: "dataTable5Amount1",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx2",
    dateKey: "dataTable5Date2",
    descKey: "dataTable5Desc2",
    categoryKey: "dataTable5Category2",
    amountKey: "dataTable5Amount2",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx3",
    dateKey: "dataTable5Date3",
    descKey: "dataTable5Desc3",
    categoryKey: "dataTable5Category3",
    amountKey: "dataTable5Amount3",
    statusKey: "dataTable5StatusPending",
    tone: "warning",
  },
  {
    txKey: "dataTable5Tx4",
    dateKey: "dataTable5Date4",
    descKey: "dataTable5Desc4",
    categoryKey: "dataTable5Category4",
    amountKey: "dataTable5Amount4",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx5",
    dateKey: "dataTable5Date5",
    descKey: "dataTable5Desc5",
    categoryKey: "dataTable5Category5",
    amountKey: "dataTable5Amount5",
    statusKey: "dataTable5StatusPending",
    tone: "warning",
  },
  {
    txKey: "dataTable5Tx6",
    dateKey: "dataTable5Date6",
    descKey: "dataTable5Desc6",
    categoryKey: "dataTable5Category6",
    amountKey: "dataTable5Amount6",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx7",
    dateKey: "dataTable5Date7",
    descKey: "dataTable5Desc7",
    categoryKey: "dataTable5Category7",
    amountKey: "dataTable5Amount7",
    statusKey: "dataTable5StatusFailed",
    tone: "error",
  },
  {
    txKey: "dataTable5Tx8",
    dateKey: "dataTable5Date8",
    descKey: "dataTable5Desc8",
    categoryKey: "dataTable5Category8",
    amountKey: "dataTable5Amount8",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx9",
    dateKey: "dataTable5Date9",
    descKey: "dataTable5Desc9",
    categoryKey: "dataTable5Category9",
    amountKey: "dataTable5Amount9",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx10",
    dateKey: "dataTable5Date10",
    descKey: "dataTable5Desc10",
    categoryKey: "dataTable5Category10",
    amountKey: "dataTable5Amount10",
    statusKey: "dataTable5StatusPending",
    tone: "warning",
  },
  {
    txKey: "dataTable5Tx11",
    dateKey: "dataTable5Date11",
    descKey: "dataTable5Desc11",
    categoryKey: "dataTable5Category11",
    amountKey: "dataTable5Amount11",
    statusKey: "dataTable5StatusCompleted",
    tone: "success",
  },
  {
    txKey: "dataTable5Tx12",
    dateKey: "dataTable5Date12",
    descKey: "dataTable5Desc12",
    categoryKey: "dataTable5Category12",
    amountKey: "dataTable5Amount12",
    statusKey: "dataTable5StatusFailed",
    tone: "error",
  },
];

function StatusPill({ label, tone }: { label: string; tone: TxTone }) {
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

export function StickyHeaderDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable5Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable5Description}</p>
        </div>
        <div className="bg-surface border-border w-full overflow-hidden rounded-xl border shadow-xs">
          <div className="max-h-[26rem] overflow-y-auto">
            <table className="w-full min-w-[680px] caption-bottom text-sm">
              <TableHeader className={STICKY_HEADER_CLASS}>
                <TableRow>
                  <TableHead className={STICKY_HEADER_CLASS}>
                    {d.dataTable5ColTransaction}
                  </TableHead>
                  <TableHead className={STICKY_HEADER_CLASS}>
                    {d.dataTable5ColDate}
                  </TableHead>
                  <TableHead className={STICKY_HEADER_CLASS}>
                    {d.dataTable5ColDescription}
                  </TableHead>
                  <TableHead className={STICKY_HEADER_CLASS}>
                    {d.dataTable5ColCategory}
                  </TableHead>
                  <TableHead className={cn(STICKY_HEADER_CLASS, "text-right")}>
                    {d.dataTable5ColAmount}
                  </TableHead>
                  <TableHead className={STICKY_HEADER_CLASS}>
                    {d.dataTable5ColStatus}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STICKY_TRANSACTIONS.map((tx) => (
                  <TableRow key={tx.txKey}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {d[tx.txKey]}
                    </TableCell>
                    <TableCell className="text-muted whitespace-nowrap">
                      {d[tx.dateKey]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {d[tx.descKey]}
                    </TableCell>
                    <TableCell className="text-muted whitespace-nowrap">
                      {d[tx.categoryKey]}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {d[tx.amountKey]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusPill label={d[tx.statusKey]} tone={tx.tone} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
