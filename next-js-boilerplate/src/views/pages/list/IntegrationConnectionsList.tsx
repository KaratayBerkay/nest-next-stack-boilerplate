"use client";

import { useState } from "react";
import {
  IconBrandSlack,
  IconCalendarEvent,
  IconChartBar,
  IconCloud,
  IconMail,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithListMessages } from "@/types/pages/list/ListMessages-types";

type Accent = "brand" | "info" | "success" | "warning";

interface ConnectionSeed {
  id: string;
  icon: Icon;
  titleKey: string;
  descriptionKey: string;
  connected: boolean;
  accent: Accent;
}

const CONNECTION_SEEDS: ConnectionSeed[] = [
  {
    id: "conn-1",
    icon: IconMail,
    titleKey: "list2Item1Title",
    descriptionKey: "list2Item1Description",
    connected: true,
    accent: "brand",
  },
  {
    id: "conn-2",
    icon: IconBrandSlack,
    titleKey: "list2Item2Title",
    descriptionKey: "list2Item2Description",
    connected: true,
    accent: "info",
  },
  {
    id: "conn-3",
    icon: IconCalendarEvent,
    titleKey: "list2Item3Title",
    descriptionKey: "list2Item3Description",
    connected: false,
    accent: "warning",
  },
  {
    id: "conn-4",
    icon: IconCloud,
    titleKey: "list2Item4Title",
    descriptionKey: "list2Item4Description",
    connected: false,
    accent: "success",
  },
  {
    id: "conn-5",
    icon: IconChartBar,
    titleKey: "list2Item5Title",
    descriptionKey: "list2Item5Description",
    connected: true,
    accent: "brand",
  },
];

const ACCENT_CLASSES: Record<Accent, string> = {
  brand: "bg-brand/10 text-brand",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const INITIAL_CONNECTED: Record<string, boolean> = {};
for (const seed of CONNECTION_SEEDS) {
  INITIAL_CONNECTED[seed.id] = seed.connected;
}

export function IntegrationConnectionsList() {
  const t = useMessages("pages") as unknown as PagesWithListMessages;
  const d = t.list;
  const [connected, setConnected] =
    useState<Record<string, boolean>>(INITIAL_CONNECTED);

  function toggleConnection(id: string) {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card>
          <CardHeader title={d.list2Heading}>
            <p className="text-muted text-sm">{d.list2Description}</p>
          </CardHeader>
          <CardContent>
            <ul className="divide-border flex flex-col divide-y">
              {CONNECTION_SEEDS.map((seed) => {
                const isConnected = connected[seed.id] ?? seed.connected;
                return (
                  <li
                    key={seed.id}
                    className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        ACCENT_CLASSES[seed.accent],
                      )}
                    >
                      <seed.icon size={20} aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-fg text-sm font-semibold">
                        {d[seed.titleKey]}
                      </span>
                      <span className="text-muted text-sm">
                        {d[seed.descriptionKey]}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:self-center">
                      <Badge
                        variant={isConnected ? "success" : "outline"}
                        size="sm"
                      >
                        {isConnected
                          ? d.list2ConnectedLabel
                          : d.list2NotConnectedLabel}
                      </Badge>
                      <Button
                        variant={isConnected ? "outline" : "primary"}
                        size="sm"
                        onClick={() => toggleConnection(seed.id)}
                      >
                        {isConnected
                          ? d.list2ManageButton
                          : d.list2ConnectButton}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
