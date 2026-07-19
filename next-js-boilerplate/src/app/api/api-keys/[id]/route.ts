import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const REVOKE_API_KEY_MUTATION = `
  mutation RevokeApiKey($id: String!) {
    revokeApiKey(id: $id)
  }
`;

const UPDATE_API_KEY_MUTATION = `
  mutation UpdateApiKey($id: String!, $name: String, $enabled: Boolean) {
    updateApiKey(id: $id, name: $name, enabled: $enabled) {
      id  name  keyPrefix  createdAt  lastUsedAt  expiresAt  enabled  role  tier
    }
  }
`;

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ statusCode: 401 }, { status: 401 });
  }

  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders) {
    return NextResponse.json(
      {
        statusCode: 403,
        exc: "EX_FORBIDDEN",
        msg: "Invalid or missing CSRF token",
        key: "errors.csrf",
      },
      { status: 403 },
    );
  }

  const { id } = await params;
  const { data: _data, errors } = await graphqlFetch(
    REVOKE_API_KEY_MUTATION,
    { id },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to revoke API key");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ statusCode: 401 }, { status: 401 });
  }

  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders) {
    return NextResponse.json(
      {
        statusCode: 403,
        exc: "EX_FORBIDDEN",
        msg: "Invalid or missing CSRF token",
        key: "errors.csrf",
      },
      { status: 403 },
    );
  }

  const { id } = await params;
  const json = await req.json();
  const { data, errors } = await graphqlFetch<{ updateApiKey: unknown }>(
    UPDATE_API_KEY_MUTATION,
    { id, ...json },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const errBody = graphqlErrorBody(errors, "Failed to update API key");
    return NextResponse.json(errBody, { status: errBody.statusCode });
  }

  return NextResponse.json(data?.updateApiKey);
}
