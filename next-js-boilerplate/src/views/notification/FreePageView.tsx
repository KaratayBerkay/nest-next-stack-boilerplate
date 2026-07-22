"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { NotificationFallback } from "@/fallbacks";
import { NotificationPageContent } from "./NotificationPageContent";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

export function FreePageView({ className }: ClassNameProps) {
  return (
    <Suspense fallback={<NotificationFallback />}>
      <ErrorBoundary>
        <NotificationPageContent className={className} />
      </ErrorBoundary>
    </Suspense>
  );
}
