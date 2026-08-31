"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

interface ServiceColumn {
  id: string;
  nameKey: string;
  taglineKey: string;
  recommended?: boolean;
}

const COLUMNS: ServiceColumn[] = [
  { id: "essentials", nameKey: "services2Service1Name", taglineKey: "services2Service1Tagline" },
  {
    id: "growth",
    nameKey: "services2Service2Name",
    taglineKey: "services2Service2Tagline",
    recommended: true,
  },
  { id: "scale", nameKey: "services2Service3Name", taglineKey: "services2Service3Tagline" },
  { id: "enterprise", nameKey: "services2Service4Name", taglineKey: "services2Service4Tagline" },
];

interface AttributeRow {
  id: string;
  labelKey: string;
  valueKeys: readonly [string, string, string, string];
}

const ROWS: AttributeRow[] = [
  {
    id: "timeline",
    labelKey: "services2Row1Label",
    valueKeys: [
      "services2Row1Service1Value",
      "services2Row1Service2Value",
      "services2Row1Service3Value",
      "services2Row1Service4Value",
    ],
  },
  {
    id: "team",
    labelKey: "services2Row2Label",
    valueKeys: [
      "services2Row2Service1Value",
      "services2Row2Service2Value",
      "services2Row2Service3Value",
      "services2Row2Service4Value",
    ],
  },
  {
    id: "support",
    labelKey: "services2Row3Label",
    valueKeys: [
      "services2Row3Service1Value",
      "services2Row3Service2Value",
      "services2Row3Service3Value",
      "services2Row3Service4Value",
    ],
  },
  {
    id: "price",
    labelKey: "services2Row4Label",
    valueKeys: [
      "services2Row4Service1Value",
      "services2Row4Service2Value",
      "services2Row4Service3Value",
      "services2Row4Service4Value",
    ],
  },
];

export function ComparisonTableServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services2Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.services2Intro}</p>
        </div>

        <div className="mt-12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-bg w-40">{s.services2ColHeader}</TableHead>
                {COLUMNS.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "min-w-40 align-bottom normal-case",
                      column.recommended && "bg-brand/5",
                    )}
                  >
                    <div className="flex flex-col gap-1.5 py-2">
                      {column.recommended && (
                        <Badge variant="default" size="sm" className="w-fit">
                          {s.services2RecommendedBadge}
                        </Badge>
                      )}
                      <span className="text-fg text-sm font-semibold">
                        {s[column.nameKey]}
                      </span>
                      <span className="text-muted text-xs font-normal normal-case">
                        {s[column.taglineKey]}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-fg text-sm font-medium">
                    {s[row.labelKey]}
                  </TableCell>
                  {row.valueKeys.map((valueKey, index) => (
                    <TableCell
                      key={valueKey}
                      className={cn(
                        "text-muted text-sm",
                        COLUMNS[index].recommended && "bg-brand/5",
                      )}
                    >
                      {s[valueKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell />
                {COLUMNS.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn("pt-4", column.recommended && "bg-brand/5")}
                  >
                    <Button
                      variant={column.recommended ? "primary" : "outline"}
                      size="sm"
                      className="w-full justify-center"
                    >
                      {s.services2CtaLabel}
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
