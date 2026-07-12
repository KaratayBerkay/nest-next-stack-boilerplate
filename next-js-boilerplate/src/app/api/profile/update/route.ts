import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const UPDATE_PROFILE = `
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id name username bio avatarUrl locale timezone }
  }
`;

export async function POST(req: Request) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken)
    return NextResponse.json({ statusCode: 401 }, { status: 401 });

  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders)
    return NextResponse.json({ statusCode: 403 }, { status: 403 });

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "errors.invalidJson",
      },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch(
    UPDATE_PROFILE,
    { input },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to update profile");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data);
}
