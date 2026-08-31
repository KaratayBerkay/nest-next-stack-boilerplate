import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
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

  let currentPassword: string;
  let newPassword: string;
  try {
    const body = await request.json();
    currentPassword = body.currentPassword;
    newPassword = body.newPassword;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "Current and new password are required",
          key: "auth.errors.passwordRequired",
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
    changePassword: boolean;
  }>(
    CHANGE_PASSWORD_MUTATION,
    { input: { currentPassword, newPassword } },
    accessToken,
    undefined,
    true,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to change password");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(
    { success: data?.changePassword ?? false },
    { status: 200 },
  );
});
