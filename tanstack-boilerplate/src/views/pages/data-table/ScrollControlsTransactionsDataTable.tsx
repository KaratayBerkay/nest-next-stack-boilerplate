"use client";

import { useRef, useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { IconButton } from "@/components/ui/Button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import { cn } from "@/lib/cn";

interface ScrollTransactionRow {
  titleKey: string;
  dateKey: string;
  statusKey: string;
  amount: number;
}

const SCROLL_TRANSACTIONS: ScrollTransactionRow[] = [
  {
    titleKey: "dataTable26Row1Title",
    dateKey: "dataTable26Row1Date",
    statusKey: "dataTable26Status1",
    amount: 1290,
  },
  {
    titleKey: "dataTable26Row2Title",
    dateKey: "dataTable26Row2Date",
    statusKey: "dataTable26Status2",
    amount: 84.5,
  },
  {
    titleKey: "dataTable26Row3Title",
    dateKey: "dataTable26Row3Date",
    statusKey: "dataTable26Status1",
    amount: 22.4,
  },
  {
    titleKey: "dataTable26Row4Title",
    dateKey: "dataTable26Row4Date",
    statusKey: "dataTable26Status3",
    amount: 340,
  },
  {
    titleKey: "dataTable26Row5Title",
    dateKey: "dataTable26Row5Date",
    statusKey: "dataTable26Status1",
    amount: 76.9,
  },
  {
    titleKey: "dataTable26Row6Title",
    dateKey: "dataTable26Row6Date",
    statusKey: "dataTable26Status2",
    amount: 512.6,
  },
];

const STATUS_PILL_CLASSES: Record<string, string> = {
  dataTable26Status1: "bg-success/10 text-success",
  dataTable26Status2: "bg-warning/10 text-warning",
  dataTable26Status3: "bg-error/10 text-error",
};

const SCROLL_STEP = 320 as const;

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function handleScroll(
  event: React.UIEvent<HTMLDivElement>,
  setCanScrollLeft: (value: boolean) => void,
  setCanScrollRight: (value: boolean) => void,
) {
  const element = event.currentTarget;
  setCanScrollLeft(element.scrollLeft > 4);
  setCanScrollRight(
    element.scrollLeft < element.scrollWidth - element.clientWidth - 4,
  );
}

function scrollTable(
  container: React.RefObject<HTMLDivElement | null>,
  delta: number,
) {
  container.current?.scrollBy({ left: delta, behavior: "smooth" });
}

export function ScrollControlsTransactionsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable26Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable26TabDescription}
          </Typography>
        </div>

        <div className="relative">
          <div
            ref={containerRef}
            onScroll={(event) =>
              handleScroll(event, setCanScrollLeft, setCanScrollRight)
            }
            className={cn(
              "border-border scroll-fade-x overflow-x-auto scroll-smooth rounded-xl border",
              !canScrollLeft && "scrolled-to-left",
              !canScrollRight && "scrolled-to-right",
            )}
          >
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th
                    scope="col"
                    className="text-muted bg-surface/50 h-10 px-2 text-left align-middle text-xs font-medium tracking-wider uppercase"
                  >
                    {d.dataTable26ColTransaction}
                  </th>
                  <th
                    scope="col"
                    className="text-muted bg-surface/50 h-10 px-2 text-left align-middle text-xs font-medium tracking-wider uppercase"
                  >
                    {d.dataTable26ColDate}
                  </th>
                  <th
                    scope="col"
                    className="text-muted bg-surface/50 h-10 px-2 text-left align-middle text-xs font-medium tracking-wider uppercase"
                  >
                    {d.dataTable26ColAmount}
                  </th>
                  <th
                    scope="col"
                    className="text-muted bg-surface/50 h-10 px-2 text-left align-middle text-xs font-medium tracking-wider uppercase"
                  >
                    {d.dataTable26ColStatus}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SCROLL_TRANSACTIONS.map((row) => (
                  <tr
                    key={row.titleKey}
                    className="border-border hover:bg-surface-hover/60 border-b transition-colors"
                  >
                    <td className="p-2 align-middle">
                      <span className="font-medium">{d[row.titleKey]}</span>
                    </td>
                    <td className="text-muted p-2 align-middle">
                      {d[row.dateKey]}
                    </td>
                    <td className="p-2 text-right align-middle font-medium tabular-nums">
                      {formatMoney(row.amount, d.dataTable26Currency)}
                    </td>
                    <td className="p-2 align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL_CLASSES[row.statusKey]}`}
                      >
                        {d[row.statusKey]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <IconButton
            icon={<IconChevronLeft size={20} />}
            label={d.dataTable26ScrollLeft}
            variant="outline"
            disabled={!canScrollLeft}
            onClick={() => scrollTable(containerRef, -SCROLL_STEP)}
            className="border-border bg-surface absolute top-1/2 -left-4 -translate-y-1/2 rounded-full shadow-md"
          />
          <IconButton
            icon={<IconChevronRight size={20} />}
            label={d.dataTable26ScrollRight}
            variant="outline"
            disabled={!canScrollRight}
            onClick={() => scrollTable(containerRef, SCROLL_STEP)}
            className="border-border bg-surface absolute top-1/2 -right-4 -translate-y-1/2 rounded-full shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
