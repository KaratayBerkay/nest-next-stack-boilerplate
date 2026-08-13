"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

interface Compare7Row {
  featureKey: string;
  primaryKey: string;
  secondaryKey: string;
  tooltipNumber?: "1" | "2" | "3";
}

const ROWS: Compare7Row[] = [
  {
    featureKey: "compare7Row1Feature",
    primaryKey: "compare7Row1Primary",
    secondaryKey: "compare7Row1Secondary",
  },
  {
    featureKey: "compare7Row2Feature",
    primaryKey: "compare7Row2Primary",
    secondaryKey: "compare7Row2Secondary",
    tooltipNumber: "1",
  },
  {
    featureKey: "compare7Row3Feature",
    primaryKey: "compare7Row3Primary",
    secondaryKey: "compare7Row3Secondary",
  },
  {
    featureKey: "compare7Row4Feature",
    primaryKey: "compare7Row4Primary",
    secondaryKey: "compare7Row4Secondary",
  },
  {
    featureKey: "compare7Row5Feature",
    primaryKey: "compare7Row5Primary",
    secondaryKey: "compare7Row5Secondary",
    tooltipNumber: "2",
  },
  {
    featureKey: "compare7Row6Feature",
    primaryKey: "compare7Row6Primary",
    secondaryKey: "compare7Row6Secondary",
  },
  {
    featureKey: "compare7Row7Feature",
    primaryKey: "compare7Row7Primary",
    secondaryKey: "compare7Row7Secondary",
  },
  {
    featureKey: "compare7Row8Feature",
    primaryKey: "compare7Row8Primary",
    secondaryKey: "compare7Row8Secondary",
    tooltipNumber: "3",
  },
  {
    featureKey: "compare7Row9Feature",
    primaryKey: "compare7Row9Primary",
    secondaryKey: "compare7Row9Secondary",
  },
];

function dottedLabel(label: string) {
  return (
    <span className="border-border cursor-help border-b border-dotted">
      {label}
    </span>
  );
}

function secondaryCell(row: Compare7Row, co: Record<string, string>) {
  const label = co[row.secondaryKey];
  if (!row.tooltipNumber) return dottedLabel(label);
  return (
    <Tooltip side="top">
      <TooltipTrigger tabIndex={0}>{dottedLabel(label)}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <span className="block text-left whitespace-normal">
          <span className="font-semibold">
            {co[`compare7Tooltip${row.tooltipNumber}Title`]}
          </span>
          <span className="mt-1 block text-xs font-normal">
            {co[`compare7Tooltip${row.tooltipNumber}Text`]}
          </span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export function CompactComparisonTable() {
  const m = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = m.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compare7Heading}
          </h2>
          <p className="text-muted text-lg">{co.compare7Description}</p>
        </div>
        <div className="mx-auto w-full max-w-3xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">
                  {co.compare7FeatureLabel}
                </TableHead>
                <TableHead className="w-1/3">shadcn/ui</TableHead>
                <TableHead className="w-1/3">Radix UI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.featureKey}>
                  <TableCell className="font-medium">
                    {co[row.featureKey]}
                  </TableCell>
                  <TableCell className="bg-surface-hover/60">
                    {co[row.primaryKey]}
                  </TableCell>
                  <TableCell>{secondaryCell(row, co)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
