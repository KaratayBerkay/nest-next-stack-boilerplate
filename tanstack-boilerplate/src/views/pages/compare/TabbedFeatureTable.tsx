"use client";

import {
  IconCircleCheck,
  IconCircleMinus,
  IconCircleX,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";

const STATUS_META = {
  ok: {
    icon: <IconCircleCheck size={18} stroke={2} />,
    className: "bg-success/10 text-success",
  },
  partial: {
    icon: <IconCircleMinus size={18} stroke={2} />,
    className: "bg-warning/10 text-warning",
  },
  no: {
    icon: <IconCircleX size={18} stroke={2} />,
    className: "bg-error/10 text-error",
  },
} as const;

type ModelStatus = keyof typeof STATUS_META;

const MODELS = [
  { id: "ssd", labelKey: "compare6ModelSsd" },
  { id: "cloud", labelKey: "compare6ModelCloud" },
  { id: "nas", labelKey: "compare6ModelNas" },
] as const;

const ATTRIBUTE_KEYS = [
  "compare6Attr1Label",
  "compare6Attr2Label",
  "compare6Attr3Label",
  "compare6Attr4Label",
  "compare6Attr5Label",
  "compare6Attr6Label",
] as const;

const RATING_KEYS = [
  ["compare6R1Ssd", "compare6R1Cloud", "compare6R1Nas"],
  ["compare6R2Ssd", "compare6R2Cloud", "compare6R2Nas"],
  ["compare6R3Ssd", "compare6R3Cloud", "compare6R3Nas"],
  ["compare6R4Ssd", "compare6R4Cloud", "compare6R4Nas"],
  ["compare6R5Ssd", "compare6R5Cloud", "compare6R5Nas"],
  ["compare6R6Ssd", "compare6R6Cloud", "compare6R6Nas"],
] as const;

const STATUS_GRID: ModelStatus[][] = [
  ["ok", "ok", "ok"],
  ["ok", "ok", "partial"],
  ["ok", "ok", "no"],
  ["ok", "ok", "partial"],
  ["ok", "ok", "no"],
  ["ok", "partial", "ok"],
];

export function TabbedFeatureTable() {
  const m = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = m.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {co.compare6Eyebrow}
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co.compare6Heading}
          </h2>
          <p className="text-muted text-lg">{co.compare6Description}</p>
        </div>

        <Tabs defaultValue="ssd" className="md:hidden">
          <TabsList className="w-full">
            {MODELS.map((model) => (
              <TabsTrigger
                key={model.id}
                value={model.id}
                className="flex-1 text-sm"
              >
                {co[model.labelKey]}
              </TabsTrigger>
            ))}
          </TabsList>
          {MODELS.map((model, mi) => (
            <TabsContent key={model.id} value={model.id} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{co.compare6FeatureLabel}</TableHead>
                    <TableHead>{co[model.labelKey]}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ATTRIBUTE_KEYS.map((attrKey, ri) => (
                    <TableRow key={attrKey}>
                      <TableCell className="font-medium">
                        {co[attrKey]}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                              STATUS_META[STATUS_GRID[ri][mi]].className,
                            )}
                          >
                            {STATUS_META[STATUS_GRID[ri][mi]].icon}
                          </span>
                          <span className="text-sm">
                            {co[RATING_KEYS[ri][mi]]}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>

        <div className="hidden max-h-[26rem] overflow-y-auto md:block">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="bg-surface sticky top-0 z-10">
                <TableHead className="sticky top-0 z-10">
                  {co.compare6FeatureLabel}
                </TableHead>
                {MODELS.map((model) => (
                  <TableHead key={model.id} className="sticky top-0 z-10">
                    {co[model.labelKey]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ATTRIBUTE_KEYS.map((attrKey, ri) => (
                <TableRow key={attrKey}>
                  <TableCell className="font-medium">{co[attrKey]}</TableCell>
                  {MODELS.map((model, mi) => (
                    <TableCell key={model.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                            STATUS_META[STATUS_GRID[ri][mi]].className,
                          )}
                        >
                          {STATUS_META[STATUS_GRID[ri][mi]].icon}
                        </span>
                        <span className="text-sm">
                          {co[RATING_KEYS[ri][mi]]}
                        </span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
