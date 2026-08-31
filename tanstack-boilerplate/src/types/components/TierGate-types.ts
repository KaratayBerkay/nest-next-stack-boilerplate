import type { ReactNode } from "react";
import type { Tier } from "@/lib/tier";

export interface TierGateProps {
  min: Tier;
  fallback?: ReactNode;
  children: ReactNode;
}
