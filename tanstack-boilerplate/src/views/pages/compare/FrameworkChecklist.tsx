"use client";

import {
  IconBrandAngular,
  IconBrandNextjs,
  IconBrandReact,
  IconBrandSvelte,
  IconBrandTailwind,
  IconBrandVue,
  IconCheck,
  IconMinus,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

type ChecklistStatus = "ok" | "partial" | "no" | "dash";

const STATUS_GLYPH: Record<
  ChecklistStatus,
  { icon: ReactNode; className: string }
> = {
  ok: { icon: <IconCheck size={18} stroke={2} />, className: "text-success" },
  partial: {
    icon: <IconMinus size={18} stroke={2} />,
    className: "text-warning",
  },
  no: { icon: <IconX size={18} stroke={2} />, className: "text-error" },
  dash: {
    icon: <IconMinus size={18} stroke={2} />,
    className: "text-muted",
  },
};

interface ChecklistRow {
  icon: ReactNode;
  labelKey: string;
  blurbKey: string;
  statuses: [ChecklistStatus, ChecklistStatus];
}

const ROWS: ChecklistRow[] = [
  {
    icon: <IconBrandReact size={20} stroke={2} />,
    labelKey: "compare8Framework1Label",
    blurbKey: "compare8Framework1Blurb",
    statuses: ["ok", "ok"],
  },
  {
    icon: <IconBrandVue size={20} stroke={2} />,
    labelKey: "compare8Framework2Label",
    blurbKey: "compare8Framework2Blurb",
    statuses: ["ok", "partial"],
  },
  {
    icon: <IconBrandNextjs size={20} stroke={2} />,
    labelKey: "compare8Framework3Label",
    blurbKey: "compare8Framework3Blurb",
    statuses: ["ok", "ok"],
  },
  {
    icon: <IconBrandAngular size={20} stroke={2} />,
    labelKey: "compare8Framework4Label",
    blurbKey: "compare8Framework4Blurb",
    statuses: ["no", "ok"],
  },
  {
    icon: <IconBrandSvelte size={20} stroke={2} />,
    labelKey: "compare8Framework5Label",
    blurbKey: "compare8Framework5Blurb",
    statuses: ["no", "partial"],
  },
  {
    icon: <IconBrandTailwind size={20} stroke={2} />,
    labelKey: "compare8Framework6Label",
    blurbKey: "compare8Framework6Blurb",
    statuses: ["ok", "ok"],
  },
];

const GRID_CLASSES =
  "md:grid md:grid-cols-[minmax(0,1fr)_7rem_7rem] md:items-center md:gap-8";

function statusCell(status: ChecklistStatus, caption: string) {
  const glyph = STATUS_GLYPH[status];
  return (
    <div className="flex items-center justify-between gap-4 md:justify-center md:gap-2">
      <span className="text-muted text-xs md:hidden">{caption}</span>
      <span className={glyph.className}>{glyph.icon}</span>
    </div>
  );
}

export function FrameworkChecklist() {
  const m = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = m.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compare8Heading}
          </h2>
          <p className="text-muted text-lg">{co.compare8Description}</p>
        </div>
        <div className="border-border divide-border w-full divide-y rounded-2xl border shadow-xs">
          <div
            className={cn(
              GRID_CLASSES,
              "border-border hidden border-b px-5 py-3",
            )}
          >
            <span aria-hidden="true" />
            <span className="text-muted text-center text-xs font-semibold tracking-wider uppercase">
              {co.compare8Column1Label}
            </span>
            <span className="text-muted text-center text-xs font-semibold tracking-wider uppercase">
              {co.compare8Column2Label}
            </span>
          </div>
          {ROWS.map((row) => (
            <div
              key={row.labelKey}
              className={cn(GRID_CLASSES, "flex flex-col gap-2 px-5 py-4")}
            >
              <div className="flex items-center gap-3">
                <span className="bg-surface-hover text-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                  {row.icon}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{co[row.labelKey]}</p>
                  <p className="text-muted text-sm">{co[row.blurbKey]}</p>
                </div>
              </div>
              {statusCell(row.statuses[0], co.compare8Column1Label)}
              {statusCell(row.statuses[1], co.compare8Column2Label)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
