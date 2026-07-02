import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: providerName } = await params;
  const env = serverEnv();
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: `/api/auth/oauth/${providerName}/callback`,
    maxAge: 600,
  });

  const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/${providerName}/callback`;
  const nestOAuthUrl = `${env.APP_URL}/auth/oauth/${providerName}?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  return NextResponse.redirect(nestOAuthUrl, 302);
}
