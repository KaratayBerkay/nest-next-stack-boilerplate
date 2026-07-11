import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const DEV_ACTIVATE_MUTATION = `
  mutation DevActivateUser($email: String!) {
    devActivateUser(email: $email)
  }
`;

/**
 * Dev-only helper: activate a user by email so e2e tests can skip email
 * verification.  Gated to non-production both here and on the backend.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ statusCode: 404 }, { status: 404 });
  }

  let email: string;
  try {
    const body = await request.json();
    email = body.email;
    if (!email) {
      return NextResponse.json(
        { statusCode: 400, msg: "Email is required" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { statusCode: 400, msg: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{ devActivateUser: boolean }>(
    DEV_ACTIVATE_MUTATION,
    { email },
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Activation failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: data?.devActivateUser ?? false }, { status: 200 });
}
