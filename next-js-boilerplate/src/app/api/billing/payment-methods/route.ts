import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const PAYMENT_METHODS_QUERY = `
  query MyPaymentMethods {
    myPaymentMethods {
      id
      brand
      last4
      expMonth
      expYear
      isDefault
    }
  }
`;

const REMOVE_PAYMENT_METHOD_MUTATION = `
  mutation RemovePaymentMethod($paymentMethodId: String!) {
    removePaymentMethod(paymentMethodId: $paymentMethodId)
  }
`;

const SET_DEFAULT_PAYMENT_METHOD_MUTATION = `
  mutation SetDefaultPaymentMethod($paymentMethodId: String!) {
    setDefaultPaymentMethod(paymentMethodId: $paymentMethodId)
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
    myPaymentMethods: Array<{
      id: string;
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
      isDefault: boolean;
    }>;
  }>(PAYMENT_METHODS_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load payment methods");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({
    paymentMethods: data?.myPaymentMethods ?? [],
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
  const { action, paymentMethodId } = body;

  if (!paymentMethodId) {
    return NextResponse.json(
      { statusCode: 400, msg: "paymentMethodId required" },
      { status: 400 },
    );
  }

  const mutation =
    action === "setDefault"
      ? SET_DEFAULT_PAYMENT_METHOD_MUTATION
      : REMOVE_PAYMENT_METHOD_MUTATION;

  const { errors } = await graphqlFetch<{ [key: string]: boolean }>(
    mutation,
    { paymentMethodId },
    accessToken,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to update payment method");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true });
}
