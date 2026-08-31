"use client";

import { IconCheck, IconMinus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";
const CONTACT_URL = "https://example.com/contact-sales";

type CellDef =
  { kind: "check" } | { kind: "dash" } | { kind: "text"; textKey: string };

interface FeatureRow {
  labelKey: string;
  cells: [CellDef, CellDef, CellDef];
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    labelKey: "pricing3RowSeatsLabel",
    cells: [
      { kind: "text", textKey: "pricing3RowSeatsFree" },
      { kind: "text", textKey: "pricing3RowSeatsPro" },
      { kind: "text", textKey: "pricing3RowSeatsEnterprise" },
    ],
  },
  {
    labelKey: "pricing3RowProjectsLabel",
    cells: [
      { kind: "text", textKey: "pricing3RowProjectsFree" },
      { kind: "text", textKey: "pricing3RowProjectsPro" },
      { kind: "text", textKey: "pricing3RowProjectsEnterprise" },
    ],
  },
  {
    labelKey: "pricing3RowStorageLabel",
    cells: [
      { kind: "text", textKey: "pricing3RowStorageFree" },
      { kind: "text", textKey: "pricing3RowStoragePro" },
      { kind: "text", textKey: "pricing3RowStorageEnterprise" },
    ],
  },
  {
    labelKey: "pricing3RowApiLabel",
    cells: [{ kind: "dash" }, { kind: "check" }, { kind: "check" }],
  },
  {
    labelKey: "pricing3RowSsoLabel",
    cells: [{ kind: "dash" }, { kind: "dash" }, { kind: "check" }],
  },
  {
    labelKey: "pricing3RowSupportLabel",
    cells: [
      { kind: "text", textKey: "pricing3RowSupportFree" },
      { kind: "text", textKey: "pricing3RowSupportPro" },
      { kind: "text", textKey: "pricing3RowSupportEnterprise" },
    ],
  },
  {
    labelKey: "pricing3RowSlaLabel",
    cells: [{ kind: "dash" }, { kind: "dash" }, { kind: "check" }],
  },
];

const GRID_COLUMNS = "grid grid-cols-[1.3fr_1fr_1fr_1fr]";

export function FeatureMatrixPricing() {
  const scrollFadeRef = useScrollFadeX<HTMLDivElement>();
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;

  const columnNames = [
    p.pricing3FreeName,
    p.pricing3ProName,
    p.pricing3EnterpriseName,
  ];
  const columnPrices = [
    p.pricing3FreePrice,
    p.pricing3ProPrice,
    p.pricing3EnterprisePrice,
  ];
  const columnCtas = [
    { label: p.pricing3FreeCta, href: SIGNUP_URL },
    { label: p.pricing3ProCta, href: SIGNUP_URL },
    { label: p.pricing3EnterpriseCta, href: CONTACT_URL },
  ];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="outline">{p.pricing3Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing3Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing3Description}
          </Typography>
        </div>
        <div ref={scrollFadeRef} className="overflow-x-auto">
          <div className="border-border min-w-[720px] overflow-hidden rounded-2xl border shadow-xs">
            <div className={GRID_COLUMNS}>
              <div className="border-border border-b px-5 py-5" />
              {columnNames.map((name, i) => (
                <div
                  key={name}
                  className="border-border bg-surface/60 border-b border-l px-5 py-5"
                >
                  <Typography variant="h5">{name}</Typography>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-fg text-2xl font-semibold">
                      {columnPrices[i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {FEATURE_ROWS.map((row) => (
              <div key={row.labelKey} className={GRID_COLUMNS}>
                <div className="border-border border-b px-5 py-4">
                  <Typography variant="body" className="text-sm font-medium">
                    {p[row.labelKey]}
                  </Typography>
                </div>
                {row.cells.map((cell, i) => (
                  <div
                    key={`${row.labelKey}-${i}`}
                    className="border-border flex items-center gap-2 border-b border-l px-5 py-4"
                  >
                    {cell.kind === "check" && (
                      <IconCheck size={18} className="text-brand shrink-0" />
                    )}
                    {cell.kind === "dash" && (
                      <IconMinus size={18} className="text-muted shrink-0" />
                    )}
                    {cell.kind === "text" && (
                      <Typography variant="body" className="text-sm">
                        {p[cell.textKey]}
                      </Typography>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className={GRID_COLUMNS}>
              <div className="px-5 py-5" />
              {columnCtas.map((cta, i) => (
                <div
                  key={`${cta.label}-${i}`}
                  className="border-border border-l px-5 py-5"
                >
                  <Button
                    asChild
                    variant={i === 1 ? "primary" : "outline"}
                    size="sm"
                    className="w-full"
                  >
                    <a href={cta.href}>{cta.label}</a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
