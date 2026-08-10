import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const TRUST_DEVICE_MUTATION = `
  mutation TrustCurrentDevice {
    trustCurrentDevice
  }
`;

export async function POST(_req: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
        key: "auth.errors.unauthorized",
      },
      { status: 401 },
    );
  }

  // trustCurrentDevice is a mutation, so SessionAuthGuard requires a CSRF echo — same pattern as api/sessions/revoke.
  const extraHeaders = await csrfEchoHeaders();

  const { data, errors } = await graphqlFetch<{ trustCurrentDevice: boolean }>(
    TRUST_DEVICE_MUTATION,
    undefined,
    accessToken,
    extraHeaders ?? undefined,
    true,
  );

  if (errors || !data?.trustCurrentDevice) {
    const body = graphqlErrorBody(errors, "Failed to trust device");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
