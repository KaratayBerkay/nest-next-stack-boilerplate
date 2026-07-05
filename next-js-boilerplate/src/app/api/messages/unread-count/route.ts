import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";

const BACKEND = serverEnv().APP_URL;

export async function GET(_request: NextRequest) {
  const token = await getAccessToken();
  const stHeaders = await sessionTokenHeaders();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...stHeaders,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BACKEND}/api/messages/unread-count`, { headers });
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Invalid response from backend" },
      { status: 502 },
    );
  }
}
