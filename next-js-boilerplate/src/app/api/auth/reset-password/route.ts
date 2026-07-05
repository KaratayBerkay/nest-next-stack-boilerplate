import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export async function POST(request: Request) {
  let token: string;
  let newPassword: string;

  try {
    const body = await request.json();
    token = body.token;
    newPassword = body.newPassword;
    if (!token || !newPassword) {
      return NextResponse.json(
        { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Token and new password are required", key: "auth.errors.passwordRequired" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Invalid JSON body", key: "auth.errors.invalidJson" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{
    resetPassword: boolean;
  }>(MUTATION, { input: { token, newPassword } });

  if (errors || data?.resetPassword === undefined) {
    const body = graphqlErrorBody(errors, "Password reset failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
