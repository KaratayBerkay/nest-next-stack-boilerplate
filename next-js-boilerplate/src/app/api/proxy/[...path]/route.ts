import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import {
  GET as GET_METHOD,
  POST as POST_METHOD,
} from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const backendPath = "/" + path.join("/");
  return proxyToBackend(backendPath, { method: GET_METHOD });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const backendPath = "/" + path.join("/");
  const body = await request.json();
  return proxyToBackend(backendPath, {
    method: POST_METHOD,
    body: JSON.stringify(body),
  });
}

async function proxyToBackend(backendPath: string, init: RequestInit) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const url = `${serverEnv().APP_URL}${backendPath}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(init.headers as Record<string, string>),
    },
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  const response = NextResponse.json(data, { status: res.status });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
