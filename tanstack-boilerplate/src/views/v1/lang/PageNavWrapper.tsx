"use client";

import { PageNavigationProvider } from "@/hooks/usePageNavigation";
import { NavigationOverlay } from "@/components/layout/NavigationOverlay";
import type { PageNavWrapperProps } from "@/types/v1/PageNavWrapper-types";

export function PageNavWrapper({ children }: PageNavWrapperProps) {
  return (
    <PageNavigationProvider>
      {children}
      <NavigationOverlay />
    </PageNavigationProvider>
  );
}
