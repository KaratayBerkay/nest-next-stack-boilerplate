import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const REVOKE_OTHERS_MUTATION = `
  mutation RevokeAllOtherSessions {
    revokeAllOtherSessions
  }
`;

export async function POST() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { statusCode: 401, exc: "EX_AUTH_INVALID_CREDENTIALS", msg: "Unauthorized", key: "auth.errors.unauthorized" },
      { status: 401 },
    );
  }

  const { errors } = await graphqlFetch(
    REVOKE_OTHERS_MUTATION,
    {},
    accessToken,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to revoke other sessions");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true });
}
