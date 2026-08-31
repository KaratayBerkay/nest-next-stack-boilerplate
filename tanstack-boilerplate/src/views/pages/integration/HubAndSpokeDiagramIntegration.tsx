"use client";

import { useState } from "react";
import {
  IconBellRinging,
  IconChartBar,
  IconCreditCard,
  IconDatabase,
  IconMessageCircle,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

interface SpokeNode {
  id: string;
  icon: Icon;
  angleDeg: number;
  nameKey: string;
  categoryKey: string;
  detailKey: string;
}

const RADIUS_PERCENT = 42;

const NODES: SpokeNode[] = [
  {
    id: "node-1",
    icon: IconUsers,
    angleDeg: -90,
    nameKey: "integration1Node1Name",
    categoryKey: "integration1Node1Category",
    detailKey: "integration1Node1Detail",
  },
  {
    id: "node-2",
    icon: IconMessageCircle,
    angleDeg: -30,
    nameKey: "integration1Node2Name",
    categoryKey: "integration1Node2Category",
    detailKey: "integration1Node2Detail",
  },
  {
    id: "node-3",
    icon: IconCreditCard,
    angleDeg: 30,
    nameKey: "integration1Node3Name",
    categoryKey: "integration1Node3Category",
    detailKey: "integration1Node3Detail",
  },
  {
    id: "node-4",
    icon: IconChartBar,
    angleDeg: 90,
    nameKey: "integration1Node4Name",
    categoryKey: "integration1Node4Category",
    detailKey: "integration1Node4Detail",
  },
  {
    id: "node-5",
    icon: IconDatabase,
    angleDeg: 150,
    nameKey: "integration1Node5Name",
    categoryKey: "integration1Node5Category",
    detailKey: "integration1Node5Detail",
  },
  {
    id: "node-6",
    icon: IconBellRinging,
    angleDeg: 210,
    nameKey: "integration1Node6Name",
    categoryKey: "integration1Node6Category",
    detailKey: "integration1Node6Detail",
  },
];

function positionFor(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + RADIUS_PERCENT * Math.cos(rad)}%`,
    top: `${50 + RADIUS_PERCENT * Math.sin(rad)}%`,
  };
}

export function HubAndSpokeDiagramIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;
  const [activeId, setActiveId] = useState<string>(NODES[0].id);

  const active = NODES.find((node) => node.id === activeId) ?? NODES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration1Intro}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:items-center lg:gap-12">
          <div
            className="relative mx-auto aspect-square w-full max-w-md lg:col-span-3"
            role="group"
            aria-label={ig.integration1DiagramAria}
          >
            <svg
              className="pointer-events-none absolute inset-0 size-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {NODES.map((node) => {
                const pos = positionFor(node.angleDeg);
                const isActive = node.id === activeId;
                return (
                  <line
                    key={node.id}
                    x1="50"
                    y1="50"
                    x2={parseFloat(pos.left)}
                    y2={parseFloat(pos.top)}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-brand" : "text-border",
                    )}
                    stroke="currentColor"
                    strokeWidth={isActive ? 0.6 : 0.35}
                    strokeDasharray={isActive ? undefined : "2 2"}
                  />
                );
              })}
            </svg>

            <div className="border-brand bg-brand/10 text-brand absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 text-center shadow-md">
              <span className="text-xs font-bold">
                {ig.integration1HubLabel}
              </span>
              <span className="text-[10px] opacity-80">
                {ig.integration1HubSublabel}
              </span>
            </div>

            {NODES.map((node) => {
              const pos = positionFor(node.angleDeg);
              const isActive = node.id === activeId;
              return (
                <button
                  key={node.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveId(node.id)}
                  style={{ left: pos.left, top: pos.top }}
                  className={cn(
                    "border-border bg-bg absolute flex size-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border shadow-xs transition-all",
                    isActive
                      ? "border-brand ring-brand scale-110 ring-2"
                      : "hover:border-brand/60 hover:scale-105",
                  )}
                >
                  <node.icon
                    size={18}
                    aria-hidden="true"
                    className={isActive ? "text-brand" : "text-fg"}
                  />
                  <span className="sr-only">{ig[node.nameKey]}</span>
                </button>
              );
            })}
          </div>

          <div className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="border-border bg-bg flex size-11 shrink-0 items-center justify-center rounded-lg border">
                <active.icon
                  size={20}
                  aria-hidden="true"
                  className="text-brand"
                />
              </span>
              <div className="min-w-0">
                <p className="text-fg truncate text-sm font-semibold">
                  {ig[active.nameKey]}
                </p>
                <Badge variant="soft" size="sm" className="mt-1">
                  {ig[active.categoryKey]}
                </Badge>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              {ig[active.detailKey]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
