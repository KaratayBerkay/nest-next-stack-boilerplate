import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const CANCEL_MUTATION = `
  mutation CancelSubscription {
    cancelSubscription
  }
`;

export async function POST(_request: NextRequest) {
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

  const extraHeaders = await csrfEchoHeaders();
  const { data: _data, errors } = await graphqlFetch<{
    cancelSubscription: boolean;
  }>(CANCEL_MUTATION, {}, accessToken, extraHeaders ?? undefined);

  if (errors) {
    const errBody = graphqlErrorBody(errors, "Cancel failed");
    return NextResponse.json(errBody, { status: errBody.statusCode });
  }

  return NextResponse.json({ ok: true });
}
