"use client";
// Router-level defaults, ported from the Next.js app directory's
// loading.tsx / not-found.tsx / global-error.tsx.

import type { ErrorComponentProps } from "@tanstack/react-router";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { GlobalErrorPage, I18nNotFoundPage } from "@/features/statics";

export function RootPendingComponent() {
  return <LogoSpinner />;
}

export function RootNotFoundComponent() {
  return <I18nNotFoundPage />;
}

export function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return <GlobalErrorPage error={error} reset={reset} />;
}
