import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { JOIN_MEETING_MUTATION } from "@/lib/graphql/rtc";
import type { JoinMeetingResult } from "@/api/server/rtc/meetings/types";

export async function POST(
  _req: Request,
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
  const { data, errors } = await graphqlFetch<{
    joinMeeting: JoinMeetingResult;
  }>(JOIN_MEETING_MUTATION, { slug }, accessToken, extraHeaders);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to join meeting");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.joinMeeting);
}
