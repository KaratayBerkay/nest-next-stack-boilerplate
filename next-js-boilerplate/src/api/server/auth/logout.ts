import { apiFetch } from "@/lib/api-client";
import {
  AUTH_LOGOUT_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function logoutServer(): Promise<void> {
  await apiFetch(AUTH_LOGOUT_URL, { method: POST });
}
