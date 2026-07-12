import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";

const BACKEND = serverEnv().APP_URL;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const stHeaders = await sessionTokenHeaders();
  if (!token) return { "Content-Type": "application/json", ...stHeaders };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...stHeaders,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const qs = request.nextUrl.searchParams.toString();
  const url = `${BACKEND}/api/${path.join("/")}${qs ? "?" + qs : ""}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers });
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const body = await request.text();
  const url = `${BACKEND}/api/${path.join("/")}`;
  const headers = await getAuthHeaders();
  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
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

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
