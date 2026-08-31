import { cn } from "@/lib";

// Cross-layer import (shared -> lib) — proves the @/* alias resolves across layers.
export const containerClass = cn("mx-auto", "w-full", "max-w-5xl", "px-4");

export const containerClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export const SITE = {
  name: "Next.js Boilerplate",
  description:
    "Next.js 16 boilerplate exercising SSR/CSR/SSE/WebSocket against a NestJS backend.",
} as const;
