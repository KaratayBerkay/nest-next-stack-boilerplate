import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const MUTATION = `
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      id
    }
  }
`;

export async function POST(request: Request) {
  let token: string;

  try {
    const body = await request.json();
    token = body.token;
    if (!token) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "Token is required",
          key: "auth.errors.tokenRequired",
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
    verifyEmail: { id: string };
  }>(MUTATION, { token });

  if (errors || !data?.verifyEmail) {
    const body = graphqlErrorBody(errors, "Verification failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
