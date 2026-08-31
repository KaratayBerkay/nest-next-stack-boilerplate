"use client";

import { useReportWebVitals } from "next/web-vitals";
import { eventLogger } from "@/lib/event-logger";

const WEB_VITALS_EVENTS: Record<string, string> = {
  LCP: "perf.page_lcp",
  FID: "perf.page_fid",
  CLS: "perf.page_cls",
  TTFB: "perf.page_ttfb",
  FCP: "perf.page_fcp",
  INP: "perf.page_inp",
};

export function usePerformanceLogger(): void {
  useReportWebVitals((metric) => {
    const eventName = WEB_VITALS_EVENTS[metric.name];
    if (!eventName) return;

    eventLogger.emit({
      eventType: eventName,
      url: window.location.pathname,
      category: "performance",
      event: eventName,
      metadata: {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        name: metric.name,
        navigationType: (metric as { navigationType?: string }).navigationType,
      },
    });
  });
}
