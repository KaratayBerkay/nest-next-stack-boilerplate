import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  RBAC_TOKEN_COOKIE,
  DEVICE_TOKEN_COOKIE,
  USER_TOKEN_COOKIE,
} from "@/lib/cookie";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    accessToken,
    rbacToken: cookieStore.get(RBAC_TOKEN_COOKIE)?.value ?? null,
    deviceToken: cookieStore.get(DEVICE_TOKEN_COOKIE)?.value ?? null,
    userToken: cookieStore.get(USER_TOKEN_COOKIE)?.value ?? null,
  });
}
