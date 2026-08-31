import { apiFetch } from "@/lib/api-client";
import { OBSERVABILITY_URL } from "@/constants/api/urls";

export type ObservabilitySnapshot = {
  startedAt: number | null;
  runtime: string | null;
  uptimeMs: number | null;
  spanCount: number;
  recentSpans: string[];
  customSpanExported: boolean;
  errors: { message: string; routerKind?: string; route?: string }[];
};

export async function getObservabilitySnapshot(): Promise<ObservabilitySnapshot> {
  const res = await apiFetch(OBSERVABILITY_URL, { cache: "no-store" });
  return res.json() as Promise<ObservabilitySnapshot>;
}
