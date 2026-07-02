"use client";

import { type ReactNode } from "react";
import { PageNavigationProvider } from "@/hooks/usePageNavigation";
import { NavigationOverlay } from "@/components/layout/NavigationOverlay";

export function PageNavWrapper({ children }: { children: ReactNode }) {
  return (
    <PageNavigationProvider>
      {children}
      <NavigationOverlay />
    </PageNavigationProvider>
  );
}
