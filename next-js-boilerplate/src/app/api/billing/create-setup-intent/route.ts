import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const SETUP_INTENT_MUTATION = `
  mutation CreateBillingSetupIntent {
    createBillingSetupIntent {
      clientSecret
    }
  }
`;

export async function POST() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    createBillingSetupIntent: { clientSecret: string };
  }>(SETUP_INTENT_MUTATION, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to create setup intent");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({
    clientSecret: data?.createBillingSetupIntent.clientSecret,
  });
}
