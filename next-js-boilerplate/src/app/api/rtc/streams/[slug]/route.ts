import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { STREAM_BY_SLUG_QUERY } from "@/lib/graphql/rtc";
import type { LiveStreamView } from "@/api/server/rtc/streams/types";

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
    streamBySlug: LiveStreamView | null;
  }>(STREAM_BY_SLUG_QUERY, { slug }, accessToken, undefined, true);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load stream");
    return NextResponse.json(body, { status: body.statusCode });
  }
  if (!data?.streamBySlug) {
    return NextResponse.json(
      { statusCode: 404, msg: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(data.streamBySlug);
}
