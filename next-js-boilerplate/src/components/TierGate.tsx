"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { tierAtLeast, type Tier } from "@/lib/tier";
import { AccessDenied } from "./AccessDenied";

interface TierGateProps {
  min: Tier;
  fallback?: ReactNode;
  children: ReactNode;
}

export function TierGate({ min, fallback, children }: TierGateProps) {
  const { user } = useAuth();
  const allowed = tierAtLeast(user?.tier, min);

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <AccessDenied />;
}
