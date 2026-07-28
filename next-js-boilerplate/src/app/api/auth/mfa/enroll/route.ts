import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const ENROLL_MFA_MUTATION = `
  mutation EnrollMfa {
    enrollMfa {
      otpauthUrl
      secret
    }
  }
`;

export const POST = withLogging(async (request, log) => {
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

  const { data, errors } = await graphqlFetch<{
    enrollMfa: { otpauthUrl: string; secret: string };
  }>(ENROLL_MFA_MUTATION, {}, accessToken);

  if (errors || !data?.enrollMfa) {
    const body = graphqlErrorBody(errors, "MFA enrollment failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data.enrollMfa, { status: 200 });
});
