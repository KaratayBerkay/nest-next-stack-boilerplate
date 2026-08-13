"use client";

import {
  IconCircleCheck,
  IconCircleMinus,
  IconCircleX,
} from "@tabler/icons-react";
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

type ModelId = "gpt" | "llama" | "claude";
type CellTone = "best" | "mid" | "worst";

const MODELS: {
  id: ModelId;
  name: string;
  vendor: string;
  monogram: string;
}[] = [
  { id: "gpt", name: "GPT-4o mini", vendor: "OpenAI", monogram: "GPT" },
  { id: "llama", name: "LLaMA 3.1 70B", vendor: "Meta", monogram: "LLaMA" },
  {
    id: "claude",
    name: "Claude 3.5 Haiku",
    vendor: "Anthropic",
    monogram: "Claude",
  },
];

const TONE_META: Record<
  CellTone,
  { icon: ReactNode; cellClassName: string; iconClassName: string }
> = {
  best: {
    icon: <IconCircleCheck size={16} stroke={2} />,
    cellClassName: "bg-success/10",
    iconClassName: "text-success",
  },
  mid: {
    icon: <IconCircleMinus size={16} stroke={2} />,
    cellClassName: "bg-surface-hover/40",
    iconClassName: "text-muted",
  },
  worst: {
    icon: <IconCircleX size={16} stroke={2} />,
    cellClassName: "bg-error/10",
    iconClassName: "text-error",
  },
};

const METRIC_KEYS = [
  "compare9Metric1Label",
  "compare9Metric2Label",
  "compare9Metric3Label",
  "compare9Metric4Label",
  "compare9Metric5Label",
  "compare9Metric6Label",
] as const;

const VALUES: string[][] = [
  ["128k tokens", "128k tokens", "200k tokens"],
  ["380 ms", "410 ms", "310 ms"],
  ["82.2%", "86.2%", "88.7%"],
  ["$0.15 / 1M", "$0.05 / 1M", "$3.00 / 1M"],
  ["500 rpm", "250 rpm", "1,000 rpm"],
  ["1M tokens", "None", "5M tokens"],
];

const TONES: CellTone[][] = [
  ["mid", "mid", "best"],
  ["mid", "worst", "best"],
  ["worst", "mid", "best"],
  ["mid", "best", "worst"],
  ["mid", "worst", "best"],
  ["mid", "worst", "best"],
];

const CARDS = [
  {
    titleKey: "compare9Card1Title",
    lineKeys: [
      "compare9Card1Line1",
      "compare9Card1Line2",
      "compare9Card1Line3",
    ],
  },
  {
    titleKey: "compare9Card2Title",
    lineKeys: [
      "compare9Card2Line1",
      "compare9Card2Line2",
      "compare9Card2Line3",
    ],
  },
  {
    titleKey: "compare9Card3Title",
    lineKeys: [
      "compare9Card3Line1",
      "compare9Card3Line2",
      "compare9Card3Line3",
    ],
  },
];

function setHoveredModel(
  setHovered: Dispatch<SetStateAction<ModelId | null>>,
  id: ModelId | null,
) {
  setHovered(id);
}

export function MetricTableAnalysis() {
  const m = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = m.compare;
  const [hoveredModel, setHovered] = useState<ModelId | null>(null);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {co.compare9Eyebrow}
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compare9Heading}
          </h2>
          <p className="text-muted text-lg">{co.compare9Description}</p>
        </div>

        <div className="max-h-[26rem] overflow-y-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-surface sticky top-0 z-10">
                <TableHead className="sticky top-0 z-10 align-middle">
                  <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                    {co.compare9MetricBandLabel}
                  </span>
                </TableHead>
                {MODELS.map((model) => (
                  <TableHead
                    key={model.id}
                    className="sticky top-0 z-10 align-middle"
                  >
                    <div className="flex flex-col gap-1.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-surface text-muted border-border flex size-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold">
                          {model.monogram}
                        </span>
                        <span className="text-fg text-sm font-semibold">
                          {model.name}
                        </span>
                      </div>
                      <span className="text-muted text-xs">{model.vendor}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {METRIC_KEYS.map((metricKey, ri) => (
                <TableRow key={metricKey}>
                  <TableCell className="font-medium">{co[metricKey]}</TableCell>
                  {MODELS.map((model, mi) => {
                    const tone = TONES[ri][mi];
                    const isHovered = hoveredModel === model.id;
                    return (
                      <TableCell
                        key={model.id}
                        onMouseEnter={() =>
                          setHoveredModel(setHovered, model.id)
                        }
                        onMouseLeave={() => setHoveredModel(setHovered, null)}
                        className={cn(
                          TONE_META[tone].cellClassName,
                          isHovered && "ring-border ring-1",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
                              TONE_META[tone].iconClassName,
                            )}
                          >
                            {TONE_META[tone].icon}
                          </span>
                          <span className="text-sm font-medium">
                            {VALUES[ri][mi]}
                          </span>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-border bg-surface rounded-2xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-4 border-b px-6 py-4">
            <h3 className="font-mono text-sm font-semibold">
              {co.compare9AnalysisTitle}
            </h3>
            <span className="text-muted font-mono text-xs">
              {co.compare9AnalysisMeta}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            {CARDS.map((card, i) => {
              const model = MODELS[i];
              const isHovered = hoveredModel === model.id;
              return (
                <div
                  key={card.titleKey}
                  onMouseEnter={() => setHoveredModel(setHovered, model.id)}
                  onMouseLeave={() => setHoveredModel(setHovered, null)}
                  className={cn(
                    "border-border rounded-xl border p-5",
                    isHovered && "bg-surface-hover/40 ring-border ring-1",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold">
                      {co[card.titleKey]}
                    </p>
                    <span className="text-muted font-mono text-xs">
                      {model.name}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {card.lineKeys.map((lineKey) => (
                      <li
                        key={lineKey}
                        className="text-muted font-mono text-xs"
                      >
                        {co[lineKey]}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="border-border border-t px-6 py-4">
            <p className="text-muted font-mono text-xs">
              <span className="text-fg font-semibold">
                {co.compare9SummaryLabel}:{" "}
              </span>
              {co.compare9SummaryText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
