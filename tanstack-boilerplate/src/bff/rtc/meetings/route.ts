import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { MY_MEETINGS_QUERY, CREATE_MEETING_MUTATION } from "@/lib/graphql/rtc";
import type { MeetingView } from "@/api/server/rtc/meetings/types";

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ meetings: [] }, { status: 200 });
  }

  const { data, errors } = await graphqlFetch<{ myMeetings: MeetingView[] }>(
    MY_MEETINGS_QUERY,
    {},
    accessToken,
    undefined,
    true,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load meetings");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ meetings: data?.myMeetings ?? [] });
}

export async function POST(req: Request) {
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

  const { title } = await req.json();
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { statusCode: 400, msg: "Title is required" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{ createMeeting: MeetingView }>(
    CREATE_MEETING_MUTATION,
    { title: title.trim() },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to create meeting");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.createMeeting, { status: 201 });
}
