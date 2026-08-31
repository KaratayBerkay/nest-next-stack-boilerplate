import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const VERIFY_CODE_MUTATION = `
  mutation VerifyEmailCode($userId: String!, $code: String!) {
    verifyEmailCode(userId: $userId, code: $code) {
      id
      email
      emailVerifiedAt
    }
  }
`;

export const POST = withLogging(async (request, _log) => {
  let userId: string;
  let code: string;

  try {
    const body = await request.json();
    userId = body.userId;
    code = body.code;
    if (!userId || !code || code.length < 6) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "userId and code are required",
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
    verifyEmailCode: {
      id: string;
      email: string;
      emailVerifiedAt: string | null;
    };
  }>(VERIFY_CODE_MUTATION, { userId, code });

  if (errors || !data?.verifyEmailCode) {
    const body = graphqlErrorBody(errors, "Email verification failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
});
