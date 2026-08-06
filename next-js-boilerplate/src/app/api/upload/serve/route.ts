import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { getAccessToken } from "@/store/ssr-cookies";
import { sessionTokenHeaders } from "@/lib/backend";

const BACKEND_SERVE_PATH = "/upload/serve";

export async function GET(request: NextRequest) {
  const objectName = request.nextUrl.searchParams.get("objectName");
  if (!objectName) {
    return new NextResponse(null, { status: 400 });
  }
  const token = await getAccessToken();
  const stHeaders = await sessionTokenHeaders();
  const headers: Record<string, string> = {
    ...stHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(
    `${serverEnv().APP_URL}${BACKEND_SERVE_PATH}?objectName=${encodeURIComponent(objectName)}`,
    { headers },
  );

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const contentType =
    res.headers.get("content-type") ?? "application/octet-stream";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
