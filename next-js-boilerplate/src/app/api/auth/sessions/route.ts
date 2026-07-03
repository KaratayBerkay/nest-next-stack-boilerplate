import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch } from "@/lib/backend";

const MY_SESSIONS_QUERY = `
  query MySessions {
    mySessions {
      id
      ip
      userAgent
      createdAt
      expiresAt
      current
    }
  }
`;

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, errors } = await graphqlFetch<{
    mySessions: Array<{
      id: string;
      ip: string | null;
      userAgent: string | null;
      createdAt: string;
      expiresAt: string;
      current: boolean;
    }>;
  }>(MY_SESSIONS_QUERY, undefined, accessToken);

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data?.mySessions ?? [] });
}
