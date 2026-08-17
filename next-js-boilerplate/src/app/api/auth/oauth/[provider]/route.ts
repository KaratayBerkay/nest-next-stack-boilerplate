import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";
import { withLogging } from "@/lib/request-logger";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) => {
  const { provider: providerName } = await params;

  return withLogging(async (_request, log) => {
    const env = serverEnv();
    const state = crypto.randomUUID();

    const cookieStore = await cookies();
    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: `/api/auth/oauth/${providerName}/callback`,
      maxAge: 600,
    });

    const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/${providerName}/callback`;
    const nestOAuthUrl = `${env.APP_URL}/auth/oauth/${providerName}?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

    let providerUrl: string | null = null;
    try {
      const res = await fetch(nestOAuthUrl, { redirect: "manual" });
      providerUrl = res.headers.get("location");
      if (!providerUrl) {
        const body = await res.text().catch(() => "(could not read body)");
        log.error(
          {
            provider: providerName,
            status: res.status,
            body: body.slice(0, 500),
          },
          "oauth: backend returned no Location header",
        );
      }
    } catch (err) {
      log.error(
        {
          provider: providerName,
          url: nestOAuthUrl,
          err: err instanceof Error ? err.message : String(err),
        },
        "oauth: fetch to backend failed",
      );
    }
    if (!providerUrl) {
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_APP_URL}/auth/login?error=oauth_unavailable`,
        302,
      );
    }
    return NextResponse.redirect(providerUrl, 302);
  })(request);
};
