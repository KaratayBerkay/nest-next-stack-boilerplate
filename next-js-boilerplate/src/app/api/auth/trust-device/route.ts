import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { withLogging } from "@/lib/request-logger";

const TRUST_DEVICE_MUTATION = `
  mutation TrustCurrentDevice {
    trustCurrentDevice
  }
`;

export const POST = withLogging(async (_request, log) => {
  const { data, errors } = await graphqlFetch<{
    trustCurrentDevice: boolean;
  }>(TRUST_DEVICE_MUTATION);

  if (errors || !data?.trustCurrentDevice) {
    const body = graphqlErrorBody(errors, "Failed to trust device");
    log.warn({ status: body.statusCode }, "trustCurrentDevice failed");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ success: true }, { status: 200 });
});
