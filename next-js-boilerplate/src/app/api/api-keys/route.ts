import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const MY_API_KEYS_QUERY = `
  query MyApiKeys {
    myApiKeys {
      id  name  keyPrefix  createdAt  lastUsedAt  expiresAt  enabled  role  tier
    }
  }
`;

const CREATE_API_KEY_MUTATION = `
  mutation CreateApiKey($name: String!, $expiresInDays: Int) {
    createApiKey(name: $name, expiresInDays: $expiresInDays) {
      fullKey
      key { id  name  keyPrefix  createdAt  expiresAt  enabled  role  tier }
    }
  }
`;

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ apiKeys: [] }, { status: 200 });
  }

  const { data, errors } = await graphqlFetch<{ myApiKeys: unknown[] }>(MY_API_KEYS_QUERY, {}, accessToken);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load API keys");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ apiKeys: data?.myApiKeys ?? [] });
}

export async function POST(req: Request) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ statusCode: 401 }, { status: 401 });
  }

  const { name, expiresInDays } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ statusCode: 400, msg: "Name is required" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{ createApiKey: { fullKey: string; key: unknown } }>(
    CREATE_API_KEY_MUTATION,
    { name: name.trim(), expiresInDays: expiresInDays ?? null },
    accessToken,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to create API key");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.createApiKey, { status: 201 });
}
