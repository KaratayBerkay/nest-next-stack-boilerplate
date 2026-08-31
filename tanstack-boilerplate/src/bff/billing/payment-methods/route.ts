import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

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
  }>(PAYMENT_METHODS_QUERY, {}, accessToken, undefined, true);

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

  let body: { action?: string; paymentMethodId?: string };
  try {
    body = await request.json();
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
  const { action, paymentMethodId } = body;

  if (!paymentMethodId) {
    return NextResponse.json(
      { statusCode: 400, msg: "paymentMethodId required" },
      { status: 400 },
    );
  }

  // Explicit allow-list, not "anything that isn't setDefault means remove" —
  // this is a destructive mutation, so an unrecognized/missing `action`
  // should fail closed instead of defaulting to removing the card.
  let mutation: string;
  if (action === "setDefault") {
    mutation = SET_DEFAULT_PAYMENT_METHOD_MUTATION;
  } else if (action === "remove") {
    mutation = REMOVE_PAYMENT_METHOD_MUTATION;
  } else {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "action must be 'setDefault' or 'remove'",
        key: "errors.invalidAction",
      },
      { status: 400 },
    );
  }

  const extraHeaders = await csrfEchoHeaders();
  const { errors } = await graphqlFetch<{ [key: string]: boolean }>(
    mutation,
    { paymentMethodId },
    accessToken,
    extraHeaders ?? undefined,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to update payment method");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true });
}
