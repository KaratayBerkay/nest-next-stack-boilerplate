import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const ME_QUERY = `
  query Me {
    me { role }
  }
`;

const RESET_MFA_MUTATION = `
  mutation ResetMfa($userId: String!) {
    resetMfa(userId: $userId)
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
  // resetMfa is SUPERADMIN-only on the backend (@Roles(UserRole.SUPERADMIN))
  // — mirrored here so a plain ADMIN gets a clean 403 instead of relying
  // solely on the backend's RolesGuard rejection.
  if (meRes.data?.me?.role !== "SUPERADMIN") {
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

  let body: { userId: string };
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

  if (!body.userId) {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "userId is required",
        key: "errors.fieldsRequired",
      },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { data, errors } = await graphqlFetch<{ resetMfa: boolean }>(
    RESET_MFA_MUTATION,
    { userId: body.userId },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: data?.resetMfa ?? false });
}
