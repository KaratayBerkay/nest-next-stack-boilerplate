import { cn } from "@/lib";

// Cross-layer import (shared -> lib) — proves the @/* alias resolves across layers.
export const containerClass = cn("mx-auto", "w-full", "max-w-5xl", "px-4");

export const SITE = {
  name: "Next.js Boilerplate",
  description:
    "Next.js 16 boilerplate exercising SSR/CSR/SSE/WebSocket against a NestJS backend.",
} as const;
