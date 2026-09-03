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
      // `private`, never `public`: this is DECRYPTED per-user-authorized
      // content (the backend serves it `private` for the same reason — see
      // upload.controller.ts). `public` invites any shared cache (the prod
      // openresty, corporate proxies) to store the plaintext and replay it
      // to a different user requesting the same objectName, bypassing the
      // backend's uploader/DM-party/room-tier authorization entirely.
      "Cache-Control": "private, max-age=31536000, immutable",
      // start.ts's global security headers skip /api/*, and this is the one
      // BFF route serving raw user-supplied bytes — mirror next.config.ts's
      // /api/upload/serve override here: framable only same-origin (the PDF
      // preview iframe), no active content, no sniffing.
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self';",
    },
  });
}
