import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";

const BACKEND = serverEnv().APP_URL;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const url = new URL(`${BACKEND}/api/conversations/${userId}/messages`);
  url.search = _request.nextUrl.search;

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(await sessionTokenHeaders()),
    },
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const body = await request.text();

  const res = await fetch(`${BACKEND}/api/conversations/${userId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(await sessionTokenHeaders()),
    },
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
