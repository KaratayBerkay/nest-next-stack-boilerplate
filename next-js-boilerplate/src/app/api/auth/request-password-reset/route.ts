import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const MUTATION = `
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input)
  }
`;

export async function POST(request: Request) {
  let email: string;

  try {
    const body = await request.json();
    email = body.email;
    if (!email) {
      return NextResponse.json(
        {
          statusCode: 400,
          exc: "EX_VALIDATION_FORM",
          msg: "Email is required",
          key: "auth.errors.emailRequired",
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
    requestPasswordReset: boolean;
  }>(MUTATION, { input: { email } });

  if (errors || data?.requestPasswordReset === undefined) {
    const body = graphqlErrorBody(errors, "Request failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
