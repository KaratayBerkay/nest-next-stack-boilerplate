"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";
import { useScrollFadeX } from "@/hooks/useScrollFadeX";

interface CodeExample16Mode {
  id: string;
  labelKey: string;
  filename: string;
  code: string;
}

const CODE_EXAMPLE_16_MODES: CodeExample16Mode[] = [
  {
    id: "server",
    labelKey: "codeExample16ModeServer",
    filename: "server.ts",
    code: `import { MetricsClient } from "@acme/metrics";

const metrics = new MetricsClient({ dashboardId: "dash_42" });

export async function loadPageMetrics() {
  return metrics.query({
    range: "last-30-days",
    series: ["pageviews", "sessions"],
  });
}`,
  },
  {
    id: "hook",
    labelKey: "codeExample16ModeHook",
    filename: "use-page-metrics.ts",
    code: `import { useQuery } from "@tanstack/react-query";
import { metricsClient } from "./metrics-client";

export function usePageMetrics() {
  return useQuery({
    queryKey: ["metrics", "page", "last-30-days"],
    queryFn: () =>
      metricsClient.query({
        range: "last-30-days",
        series: ["pageviews", "sessions"],
      }),
  });
}`,
  },
  {
    id: "react",
    labelKey: "codeExample16ModeReact",
    filename: "PageMetrics.tsx",
    code: `import { usePageMetrics } from "./use-page-metrics";

export function PageMetrics() {
  const { data, isLoading } = usePageMetrics();

  if (isLoading) return <p>Loading metrics...</p>;

  return (
    <section>
      <h2>Page overview</h2>
      <p>{data?.pageviews.toLocaleString()} pageviews</p>
      <p>{data?.sessions.toLocaleString()} sessions</p>
    </section>
  );
}`,
  },
];

export function AnalyticsSnippetModes() {
  const scrollFadeRef = useScrollFadeX<HTMLPreElement>();
  const m = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = m.codeExample;
  const [modeId, setModeId] = useState(CODE_EXAMPLE_16_MODES[0].id);

  const activeMode =
    CODE_EXAMPLE_16_MODES.find((mode) => mode.id === modeId) ??
    CODE_EXAMPLE_16_MODES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {co["codeExample16Eyebrow"]}
          </span>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co["codeExample16Title"]}
          </h2>
          <p className="text-muted text-lg">{co["codeExample16Description"]}</p>
          <Button className="mt-2">{co["codeExample16Cta"]}</Button>
        </div>
        <div className="border-border bg-surface w-full overflow-hidden rounded-2xl border">
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <span className="text-muted font-mono text-xs">
              {activeMode.filename}
            </span>
            <div className="flex items-center gap-3">
              <Tabs
                value={modeId}
                onValueChange={setModeId}
                className="hidden sm:block"
              >
                <TabsList>
                  {CODE_EXAMPLE_16_MODES.map((mode) => (
                    <TabsTrigger
                      key={mode.id}
                      value={mode.id}
                      className="text-sm"
                    >
                      {co[mode.labelKey]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="sm:hidden">
                <Select
                  value={modeId}
                  onValueChange={setModeId}
                  name="code-example-16-mode"
                >
                  <SelectTrigger className="w-44">
                    {co[activeMode.labelKey]}
                  </SelectTrigger>
                  <SelectContent>
                    {CODE_EXAMPLE_16_MODES.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        {co[mode.labelKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <pre
            ref={scrollFadeRef}
            className="overflow-x-auto p-4 font-mono text-sm leading-relaxed"
          >
            <code>{activeMode.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
