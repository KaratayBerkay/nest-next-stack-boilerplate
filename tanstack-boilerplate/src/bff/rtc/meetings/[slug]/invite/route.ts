import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { INVITE_TO_MEETING_MUTATION } from "@/lib/graphql/rtc";

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
  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { statusCode: 400, msg: "userId is required" },
      { status: 400 },
    );
  }

  const { errors } = await graphqlFetch(
    INVITE_TO_MEETING_MUTATION,
    { slug, userId },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to invite to meeting");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ ok: true });
}
