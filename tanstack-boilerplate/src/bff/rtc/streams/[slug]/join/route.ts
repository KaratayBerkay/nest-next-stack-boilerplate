import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { JOIN_STREAM_AS_VIEWER_MUTATION } from "@/lib/graphql/rtc";
import type { LiveStreamJoinResult } from "@/api/server/rtc/streams/types";

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
    joinStreamAsViewer: LiveStreamJoinResult;
  }>(JOIN_STREAM_AS_VIEWER_MUTATION, { slug }, accessToken, extraHeaders);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to join stream");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.joinStreamAsViewer);
}
