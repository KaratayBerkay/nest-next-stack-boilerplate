import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const RESEND_LOGIN_CODE_MUTATION = `
  mutation ResendLoginCode($mfaToken: String!) {
    resendLoginCode(mfaToken: $mfaToken)
  }
`;

export const POST = withLogging(async (request, log) => {
  let mfaToken: string;

  try {
    const body = await request.json();
    mfaToken = body.mfaToken;
    if (!mfaToken) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "MFA token is required",
          key: "auth.errors.mfaRequired",
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
    resendLoginCode: string;
  }>(RESEND_LOGIN_CODE_MUTATION, { mfaToken });

  if (errors || !data?.resendLoginCode) {
    const body = graphqlErrorBody(errors, "Failed to resend login code");
    log.warn({ status: body.statusCode }, "resendLoginCode failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ msg: data.resendLoginCode }, { status: 200 });
});
