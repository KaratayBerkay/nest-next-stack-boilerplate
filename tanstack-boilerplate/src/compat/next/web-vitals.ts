"use client";
// Compat shim for `next/web-vitals`, backed by the web-vitals package.

import { useEffect, useRef } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

export type NextWebVitalsMetric = Metric & { label?: string };

export function useReportWebVitals(
  reportWebVitalsFn: (metric: NextWebVitalsMetric) => void,
): void {
  const callbackRef = useRef(reportWebVitalsFn);
  callbackRef.current = reportWebVitalsFn;

  useEffect(() => {
    const report = (metric: Metric) =>
      callbackRef.current({ ...metric, label: "web-vital" });
    onCLS(report);
    onFCP(report);
    onINP(report);
    onLCP(report);
    onTTFB(report);
  }, []);
}
