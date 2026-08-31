"use client";

import {
  IconApi,
  IconBolt,
  IconBuildingSkyscraper,
  IconCheck,
  IconCoin,
  IconMicrophone,
  IconMinus,
  IconPalette,
  IconShieldLock,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCompareMessages } from "@/types/pages/compare/CompareMessages-types";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";

interface FeatureRow {
  icon: ReactNode;
  labelKey: string;
  middleKey: string;
  rightKey?: string;
  soon?: boolean;
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    icon: <IconCoin size={18} className="text-muted" />,
    labelKey: "compare3Row1Label",
    middleKey: "compare3Row1Middle",
    rightKey: "compare3Row1Right",
  },
  {
    icon: <IconPalette size={18} className="text-muted" />,
    labelKey: "compare3Row2Label",
    middleKey: "compare3Row2Middle",
    rightKey: "compare3Row2Right",
  },
  {
    icon: <IconShieldLock size={18} className="text-muted" />,
    labelKey: "compare3Row3Label",
    middleKey: "compare3Row3Middle",
    rightKey: "compare3Row3Right",
  },
  {
    icon: <IconBuildingSkyscraper size={18} className="text-muted" />,
    labelKey: "compare3Row4Label",
    middleKey: "compare3Row4Middle",
    rightKey: "compare3Row4Right",
  },
  {
    icon: <IconApi size={18} className="text-muted" />,
    labelKey: "compare3Row5Label",
    middleKey: "compare3Row5Middle",
    rightKey: "compare3Row5Right",
  },
  {
    icon: <IconMicrophone size={18} className="text-muted" />,
    labelKey: "compare3Row6Label",
    middleKey: "compare3Row6Middle",
    soon: true,
  },
];

const GRID_COLUMNS = "grid grid-cols-[1.1fr_1.15fr_1fr]";

export function ThreeColumnComparison() {
  const scrollFadeRef = useScrollFadeX<HTMLDivElement>();
  const t = useMessages("pages") as unknown as PagesWithCompareMessages;
  const co = t.compare;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="outline">{co.compare3Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {co.compare3Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.compare3Description}
          </Typography>
        </div>
        <div ref={scrollFadeRef} className="overflow-x-auto">
          <div className="border-border min-w-[640px] overflow-hidden rounded-2xl border shadow-xs">
            <div className={GRID_COLUMNS}>
              <div className="border-border border-b px-5 py-4" />
              <div className="bg-surface-hover border-border border-b border-l px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="bg-brand/10 border-brand/30 flex size-9 items-center justify-center rounded-lg border">
                    <IconBolt size={18} className="text-brand" />
                  </span>
                  <div className="flex flex-col">
                    <Typography variant="h6">Nexus AI</Typography>
                    <Typography variant="caption" className="text-xs">
                      {co.compare3MiddleTagline}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className="border-border border-b border-l px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="bg-surface-hover border-border flex size-9 items-center justify-center rounded-lg border">
                    <IconShieldLock size={18} className="text-muted" />
                  </span>
                  <Typography variant="h6">Competitor</Typography>
                </div>
              </div>
            </div>
            {FEATURE_ROWS.map((row) => (
              <div key={row.labelKey} className={GRID_COLUMNS}>
                <div className="border-border border-b px-5 py-4">
                  <div className="flex items-center gap-3">
                    {row.icon}
                    <Typography variant="body" className="font-semibold">
                      {co[row.labelKey]}
                    </Typography>
                  </div>
                </div>
                <div className="bg-surface-hover border-border flex items-center gap-2.5 border-b border-l px-5 py-4">
                  <IconCheck size={18} className="text-brand shrink-0" />
                  <Typography variant="body" className="text-sm">
                    {co[row.middleKey]}
                  </Typography>
                </div>
                <div className="border-border flex items-center gap-2.5 border-b border-l px-5 py-4">
                  {row.soon ? (
                    <Badge variant="secondary" size="sm">
                      Soon
                    </Badge>
                  ) : (
                    <>
                      <IconMinus size={18} className="text-muted shrink-0" />
                      <Typography variant="body" className="text-muted text-sm">
                        {co[row.rightKey ?? ""]}
                      </Typography>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className={GRID_COLUMNS}>
              <div className="border-border border-b px-5 py-4" />
              <div className="bg-surface-hover border-border border-l px-5 py-4" />
              <div className="border-border border-l px-5 py-4">
                <Button variant="primary" className="w-full">
                  {co.compare3Cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
