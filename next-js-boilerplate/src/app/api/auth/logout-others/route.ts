import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlFetch } from "@/lib/backend";

const LOGOUT_OTHERS_MUTATION = `
  mutation LogoutOtherSessions {
    logoutOtherSessions
  }
`;

export async function POST() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{
    logoutOtherSessions: boolean;
  }>(
    LOGOUT_OTHERS_MUTATION,
    undefined,
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: 500 });
  }

  return NextResponse.json({ ok: data?.logoutOtherSessions ?? false });
}
