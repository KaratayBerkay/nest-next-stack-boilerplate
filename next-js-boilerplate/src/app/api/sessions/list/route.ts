import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const MY_SESSIONS_QUERY = `
  query MySessions {
    mySessions {
      sessionId
      deviceId
      ip
      userAgent
      issuedAt
    }
  }
`;

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
        key: "auth.errors.unauthorized",
      },
      { status: 401 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    mySessions: Array<{
      sessionId: string;
      deviceId: string;
      ip?: string;
      userAgent?: string;
      issuedAt?: string;
    }>;
  }>(MY_SESSIONS_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load sessions");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ sessions: data?.mySessions ?? [] });
}
