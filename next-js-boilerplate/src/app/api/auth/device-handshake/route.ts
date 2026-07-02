import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import {
  deviceTokenCookieOptions,
  clearDeviceCookieOptions,
} from "@/lib/cookie";
import { cookies } from "next/headers";

export async function POST() {
  const backend = await backendFetch<{ deviceToken: string }>("/devices/handshake", {
    method: "POST",
  });

  if (!backend.ok) {
    // On failure, clear the stale device cookie and return an empty token.
    (await cookies()).set(clearDeviceCookieOptions());
    return NextResponse.json({ deviceToken: null }, { status: 200 });
  }

  const { deviceToken } = backend.data;
  (await cookies()).set(deviceTokenCookieOptions(deviceToken));
  return NextResponse.json({ deviceToken });
}
