import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { REPORT_MEETING_MUTATION } from "@/lib/graphql/rtc";
import type { RtcReportView } from "@/api/server/rtc/shared-types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const accessToken = await getAccessToken();
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

  const { slug } = await params;
  const { reason, details, reportedUserId } = await req.json();
  if (!reason || typeof reason !== "string") {
    return NextResponse.json(
      { statusCode: 400, msg: "reason is required" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    reportMeeting: RtcReportView;
  }>(
    REPORT_MEETING_MUTATION,
    { slug, reason, details, reportedUserId },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to submit report");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.reportMeeting ?? { ok: true });
}
