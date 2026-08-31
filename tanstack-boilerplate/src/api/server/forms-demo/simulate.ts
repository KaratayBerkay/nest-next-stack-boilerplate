import { apiFetchJson } from "@/lib/api-client";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { FORMS_DEMO_SIMULATE_ERROR_URL } from "@/constants/api/urls";
import type { ExceptionResponse } from "@/lib/api-client";

export async function simulateErrorServer(
  scenarioId: string,
  opts?: { delayMs?: number; failRate?: number },
): Promise<ExceptionResponse> {
  return apiFetchJson(FORMS_DEMO_SIMULATE_ERROR_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      scenarioId,
      delayMs: opts?.delayMs ?? 0,
      failRate: opts?.failRate ?? 1,
    }),
  });
}
