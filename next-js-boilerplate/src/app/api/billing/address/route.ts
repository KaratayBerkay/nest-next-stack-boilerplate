import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const BILLING_ADDRESS_QUERY = `
  query MyBillingAddress {
    myBillingAddress {
      name
      street
      city
      state
      country
      zipCode
      vatNumber
    }
  }
`;

const UPSERT_BILLING_ADDRESS_MUTATION = `
  mutation UpsertBillingAddress($input: BillingAddressInput!) {
    upsertBillingAddress(input: $input) {
      name
      street
      city
      state
      country
      zipCode
      vatNumber
    }
  }
`;

export async function GET() {
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
    myBillingAddress: {
      name: string | null;
      street: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      zipCode: string | null;
      vatNumber: string | null;
    } | null;
  }>(BILLING_ADDRESS_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load billing address");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({
    address: data?.myBillingAddress ?? null,
  });
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const { input } = body;

  const { data, errors } = await graphqlFetch<{
    upsertBillingAddress: {
      name: string | null;
      street: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      zipCode: string | null;
      vatNumber: string | null;
    };
  }>(UPSERT_BILLING_ADDRESS_MUTATION, { input }, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to update billing address");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({
    address: data?.upsertBillingAddress ?? null,
  });
}
