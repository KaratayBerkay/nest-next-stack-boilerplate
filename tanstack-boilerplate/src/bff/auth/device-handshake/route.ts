import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/backend";
import {
  deviceTokenCookieOptions,
  clearDeviceCookieOptions,
} from "@/lib/cookie";
import { POST as POST_METHOD } from "@/constants/api/methods";

export async function POST(request: NextRequest) {
  // Cross-site guard. This endpoint is deliberately pre-auth (it runs on
  // every page load), so SameSite=Lax on the auth cookies doesn't protect
  // it — a cross-site form POST would reach the backend cookie-less, mint a
  // FRESH landing token, and the Set-Cookie on the response would overwrite
  // the victim's device_token: forced device rotation (trusted-device reset,
  // wire-crypto re-key) with zero attacker knowledge required. Browsers
  // stamp Sec-Fetch-Site on every request; nothing cross-site has business
  // here (our own JS sends "same-origin"/"same-site"; header-less legacy
  // clients pass through).
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ deviceToken: null }, { status: 403 });
  }

  const backend = await backendFetch<{ deviceToken: string }>(
    "/devices/handshake",
    {
      method: POST_METHOD,
    },
  );

  if (!backend.ok) {
    const response = NextResponse.json({ deviceToken: null }, { status: 200 });
    response.cookies.set(clearDeviceCookieOptions());
    return response;
  }

  const { deviceToken } = backend.data;
  const response = NextResponse.json({ deviceToken });
  response.cookies.set(deviceTokenCookieOptions(deviceToken));
  return response;
}
