import { useAuth } from "@/hooks/useAuth";
import { tierAtLeast, type Tier } from "@/lib/tier";

export function useMinTier(min: Tier): boolean {
  const { user } = useAuth();
  return tierAtLeast(user?.tier, min);
}
