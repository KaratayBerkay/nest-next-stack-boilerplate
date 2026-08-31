import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const ME_QUERY = `
  query Me {
    me { role }
  }
`;

const SET_USER_STATUS_MUTATION = `
  mutation SetUserStatus($userId: String!, $status: UserStatus!, $reason: String) {
    setUserStatus(userId: $userId, status: $status, reason: $reason)
  }
`;

export async function POST(request: NextRequest) {
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

  const meRes = await graphqlFetch<{ me: { role: string } }>(
    ME_QUERY,
    undefined,
    accessToken,
  );
  if (
    meRes.data?.me?.role !== "ADMIN" &&
    meRes.data?.me?.role !== "SUPERADMIN"
  ) {
    return NextResponse.json(
      {
        statusCode: 403,
        exc: "EX_FORBIDDEN",
        msg: "Forbidden",
        key: "auth.errors.forbidden",
      },
      { status: 403 },
    );
  }

  let body: { userId: string; status: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "errors.invalidJson",
      },
      { status: 400 },
    );
  }

  if (!body.userId || !body.status) {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "userId and status are required",
        key: "errors.fieldsRequired",
      },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{ setUserStatus: boolean }>(
    SET_USER_STATUS_MUTATION,
    { userId: body.userId, status: body.status, reason: body.reason },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: data?.setUserStatus ?? false });
}
