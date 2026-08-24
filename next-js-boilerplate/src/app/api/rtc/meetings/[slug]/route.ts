import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { MEETING_BY_SLUG_QUERY } from "@/lib/graphql/rtc";
import type { MeetingView } from "@/api/server/rtc/meetings/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ statusCode: 401 }, { status: 401 });
  }

  const { slug } = await params;
  const { data, errors } = await graphqlFetch<{
    meetingBySlug: MeetingView | null;
  }>(MEETING_BY_SLUG_QUERY, { slug }, accessToken, undefined, true);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load meeting");
    return NextResponse.json(body, { status: body.statusCode });
  }
  if (!data?.meetingBySlug) {
    return NextResponse.json(
      { statusCode: 404, msg: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(data.meetingBySlug);
}
