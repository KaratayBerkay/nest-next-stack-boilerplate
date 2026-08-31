import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const DISABLE_MFA_MUTATION = `
  mutation DisableMfa($code: String!) {
    disableMfa(code: $code)
  }
`;

export const POST = withLogging(async (request, _log) => {
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

  let code: string;
  try {
    const body = await request.json();
    code = body.code;
    if (!code || code.length < 6) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "Code is required",
          key: "mfa.errors.invalidCode",
        },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "auth.errors.invalidJson",
      },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    disableMfa: boolean;
  }>(DISABLE_MFA_MUTATION, { code }, accessToken, undefined, true);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to disable MFA");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(
    { success: data?.disableMfa ?? false },
    { status: 200 },
  );
});
