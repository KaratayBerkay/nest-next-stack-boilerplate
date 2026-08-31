"use client";

import { useAuth } from "@/hooks/useAuth";
import { tierAtLeast } from "@/lib/tier";
import { AccessDenied } from "./AccessDenied";
import type { TierGateProps } from "@/types/components/TierGate-types";

export function TierGate({ min, fallback, children }: TierGateProps) {
  const { user } = useAuth();
  const allowed = tierAtLeast(user?.tier, min);

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <AccessDenied />;
}
