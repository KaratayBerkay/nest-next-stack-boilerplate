"use client";

import { useMediaQuery } from "./useMediaQuery";
import { breakpoints } from "@/constants/ui";

export type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(breakpoints[breakpoint]);
}


