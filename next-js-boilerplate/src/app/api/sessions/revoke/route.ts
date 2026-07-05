import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const REVOKE_SESSION_MUTATION = `
  mutation RevokeSession($sessionId: ID!) {
    revokeSession(sessionId: $sessionId)
  }
`;

export async function POST(req: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, exc: "EX_AUTH_INVALID_CREDENTIALS", msg: "Unauthorized", key: "auth.errors.unauthorized" },
      { status: 401 },
    );
  }

  const { sessionId } = await req.json() as { sessionId: string };
  if (!sessionId) {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "sessionId is required", key: "validation.required" },
      { status: 400 },
    );
  }

  // revokeSession is a mutation, so SessionAuthGuard requires a CSRF echo — same
  // pattern as api/auth/logout and api/billing/subscribe.
  const extraHeaders = await csrfEchoHeaders();

  const { errors } = await graphqlFetch(
    REVOKE_SESSION_MUTATION,
    { sessionId },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to revoke session");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true });
}
