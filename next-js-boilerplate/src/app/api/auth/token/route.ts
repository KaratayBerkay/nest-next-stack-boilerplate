import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ token });
}
