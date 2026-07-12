import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import {
  deviceTokenCookieOptions,
  clearDeviceCookieOptions,
} from "@/lib/cookie";

export async function POST() {
  const backend = await backendFetch<{ deviceToken: string }>(
    "/devices/handshake",
    {
      method: "POST",
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
