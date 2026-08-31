import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { forwardedForHeader, sessionTokenHeaders } from "@/lib/backend";
import { bearerAuthHeader } from "@/constants/api/headers";

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = `${serverEnv().APP_URL}/api/conversations`;
  const res = await fetch(url, {
    headers: {
      ...bearerAuthHeader(accessToken),
      ...(await forwardedForHeader()),
      ...(await sessionTokenHeaders()),
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
