import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const nonce = (await headers()).get("x-nonce");
  return NextResponse.json({ nonce });
}
