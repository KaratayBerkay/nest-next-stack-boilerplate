"use client";

import { useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

const ROW_HEIGHT = 56 as const;
const TOTAL_ROWS = 500 as const;
const VISIBLE_ROWS = 30 as const;

function fillTemplate(template: string, index: number): string {
  return template.replace("{n}", String(index + 1));
}

function rowValue(index: number): number {
  return ((index * 137) % 900) + 100;
}

function handleVirtualScroll(
  event: React.UIEvent<HTMLDivElement>,
  setStartIndex: (index: number) => void,
) {
  setStartIndex(Math.floor(event.currentTarget.scrollTop / ROW_HEIGHT));
}

export function VirtualizedDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const [startIndex, setStartIndex] = useState(0);

  const endIndex = Math.min(startIndex + VISIBLE_ROWS, TOTAL_ROWS);
  const visibleRows = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    visibleRows.push(i);
  }
  const topSpacer = startIndex * ROW_HEIGHT;
  const bottomSpacer = (TOTAL_ROWS - endIndex) * ROW_HEIGHT;
  const counter = d.dataTable27RowCounter
    .replace("{start}", String(startIndex + 1))
    .replace("{end}", String(endIndex))
    .replace("{total}", String(TOTAL_ROWS));

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable27Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable27TabDescription}
          </Typography>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted text-sm">{counter}</span>
            <span className="text-muted text-sm">
              {d.dataTable27ScrollHint}
            </span>
          </div>

          <div
            onScroll={(event) => handleVirtualScroll(event, setStartIndex)}
            className="border-border bg-surface rounded-xl border shadow-xs"
            style={{ height: `${ROW_HEIGHT * 10 + 44}px`, overflowY: "auto" }}
          >
            <div className="grid grid-cols-[1fr_1fr_120px] items-center gap-4 border-b px-4">
              <span className="text-muted bg-surface/50 py-2.5 text-xs font-medium tracking-wider uppercase">
                {d.dataTable27ColName}
              </span>
              <span className="text-muted bg-surface/50 py-2.5 text-xs font-medium tracking-wider uppercase">
                {d.dataTable27ColEmail}
              </span>
              <span className="text-muted bg-surface/50 py-2.5 text-xs font-medium tracking-wider uppercase">
                {d.dataTable27ColValue}
              </span>
            </div>
            <div
              style={{
                paddingTop: `${topSpacer}px`,
                paddingBottom: `${bottomSpacer}px`,
              }}
            >
              {visibleRows.map((index) => (
                <div
                  key={index}
                  className="hover:bg-surface-hover/60 grid grid-cols-[1fr_1fr_120px] items-center gap-4 border-b px-4 transition-colors last:border-b-0"
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  <span className="truncate text-sm font-medium">
                    {fillTemplate(d.dataTable27NameTemplate, index)}
                  </span>
                  <span className="text-muted truncate text-sm">
                    {fillTemplate(d.dataTable27EmailTemplate, index)}
                  </span>
                  <span className="text-right text-sm font-medium tabular-nums">
                    {rowValue(index)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
