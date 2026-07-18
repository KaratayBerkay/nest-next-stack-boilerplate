import { POST } from "@/constants/api/methods";
import { AUTH_DEVICE_HANDSHAKE_URL } from "@/constants/api/urls";

export async function deviceHandshakeServer(): Promise<void> {
  await fetch(AUTH_DEVICE_HANDSHAKE_URL, { method: POST }).catch(() => {});
}
