import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { LIVE_STREAMS_QUERY, GO_LIVE_MUTATION } from "@/lib/graphql/rtc";
import type {
  LiveStreamView,
  LiveStreamJoinResult,
} from "@/api/server/rtc/streams/types";

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ streams: [] }, { status: 200 });
  }

  const { data, errors } = await graphqlFetch<{
    liveStreams: LiveStreamView[];
  }>(LIVE_STREAMS_QUERY, {}, accessToken, undefined, true);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load live streams");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ streams: data?.liveStreams ?? [] });
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

  const { data, errors } = await graphqlFetch<{
    goLive: LiveStreamJoinResult;
  }>(GO_LIVE_MUTATION, { title: title.trim() }, accessToken, extraHeaders);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to go live");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.goLive, { status: 201 });
}
