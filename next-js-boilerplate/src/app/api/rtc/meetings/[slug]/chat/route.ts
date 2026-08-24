import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { MEETING_CHAT_MESSAGES_QUERY } from "@/lib/graphql/rtc";
import type { MeetingChatMessagesPage } from "@/api/server/rtc/meetings/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ statusCode: 401 }, { status: 401 });
  }

  const { slug } = await params;
  const before = req.nextUrl.searchParams.get("before") ?? undefined;
  const takeParam = req.nextUrl.searchParams.get("take");
  const take = takeParam ? Number(takeParam) : undefined;

  const { data, errors } = await graphqlFetch<{
    meetingChatMessages: MeetingChatMessagesPage;
  }>(
    MEETING_CHAT_MESSAGES_QUERY,
    { slug, before, take },
    accessToken,
    undefined,
    true,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load meeting chat");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(
    data?.meetingChatMessages ?? { messages: [], hasMore: false },
  );
}
