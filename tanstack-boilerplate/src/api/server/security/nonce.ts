import { apiFetchJson } from "@/lib/api-client";
import { SECURITY_NONCE_URL } from "@/constants/api/urls";

export type NonceResult = {
  nonce: string | null;
};

export async function getNonceServer(): Promise<NonceResult> {
  return apiFetchJson<NonceResult>(SECURITY_NONCE_URL);
}
