import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const RESEND_CODE_MUTATION = `
  mutation ResendEmailCode($userId: String!, $email: String!) {
    resendEmailCode(userId: $userId, email: $email)
  }
`;

export const POST = withLogging(async (request, log) => {
  let userId: string;
  let email: string;

  try {
    const body = await request.json();
    userId = body.userId;
    email = body.email;
    if (!userId || !email) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "userId and email are required",
          key: "auth.errors.validation",
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
    resendEmailCode: boolean;
  }>(RESEND_CODE_MUTATION, { userId, email }, undefined, undefined, true);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to resend code");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
});
