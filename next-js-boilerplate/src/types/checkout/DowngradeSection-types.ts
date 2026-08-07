import type { Dispatch, SetStateAction } from "react";

export interface DowngradeSectionProps {
  targetTier: string;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  onSuccess: (effectiveAt: string | null) => void;
  confirmLabel: string;
  redirectDelayMs: number;
}
