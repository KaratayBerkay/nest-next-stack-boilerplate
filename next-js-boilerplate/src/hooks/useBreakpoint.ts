"use client";

import { useMediaQuery } from "./useMediaQuery";
import { breakpoints } from "@/constants/ui";

export type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(breakpoints[breakpoint]);
}

export function useBreakpointValue<T>(values: Record<Breakpoint, T>): T {
  const md = useBreakpoint("md");
  const lg = useBreakpoint("lg");
  const xl = useBreakpoint("xl");
  const xxl = useBreakpoint("2xl");

  if (xxl) return values["2xl"];
  if (xl) return values.xl;
  if (lg) return values.lg;
  if (md) return values.md;
  return values.sm;
}
