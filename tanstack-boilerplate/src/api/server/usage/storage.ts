import { apiFetch } from "@/lib/api-client";
import { USAGE_STORAGE_URL } from "@/constants/api/urls";

export type SubscriptionTier = "FREE" | "BASIC" | "MEDIUM" | "PREMIUM";

export interface UploadStorageUsageResult {
  bytes: number;
  fileCount: number;
  limitBytes: number;
  tier: SubscriptionTier;
  multiplier: number;
}

export async function fetchStorageUsageServer(): Promise<UploadStorageUsageResult> {
  const res = await apiFetch(USAGE_STORAGE_URL);
  if (!res.ok) throw new Error("Failed to fetch upload storage usage");
  return (await res.json()) as UploadStorageUsageResult;
}
