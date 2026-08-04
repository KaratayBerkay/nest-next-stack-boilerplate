import { POST } from "@/constants/api/methods";
import { AUTH_DEVICE_HANDSHAKE_URL } from "@/constants/api/urls";

export async function deviceHandshakeServer(): Promise<void> {
  try {
    const res = await fetch(AUTH_DEVICE_HANDSHAKE_URL, { method: POST });
    if (!res.ok) return;
    const body = (await res.json()) as { deviceToken?: string };
    if (body.deviceToken) {
      const { setDeviceToken } = await import("@/lib/crypto/device-storage");
      setDeviceToken(body.deviceToken);
    }
  } catch {
    /* best-effort — handshake failure must not block auth flow */
  }
}
