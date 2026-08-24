import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import {
  MUTE_MEETING_PARTICIPANT_MUTATION,
  REMOVE_MEETING_PARTICIPANT_MUTATION,
} from "@/lib/graphql/rtc";

// Host controls — one route, action-discriminated body, mirrors how
// removeMeetingParticipant/muteMeetingParticipant are two thin mutations on
// the same underlying "act on a participant" concept.
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
  const { action, userId, muted } = await req.json();
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { statusCode: 400, msg: "userId is required" },
      { status: 400 },
    );
  }

  if (action === "mute") {
    const { errors } = await graphqlFetch(
      MUTE_MEETING_PARTICIPANT_MUTATION,
      { slug, userId, muted: Boolean(muted) },
      accessToken,
      extraHeaders,
    );
    if (errors) {
      const body = graphqlErrorBody(errors, "Failed to mute participant");
      return NextResponse.json(body, { status: body.statusCode });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "remove") {
    const { errors } = await graphqlFetch(
      REMOVE_MEETING_PARTICIPANT_MUTATION,
      { slug, userId },
      accessToken,
      extraHeaders,
    );
    if (errors) {
      const body = graphqlErrorBody(errors, "Failed to remove participant");
      return NextResponse.json(body, { status: body.statusCode });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { statusCode: 400, msg: "Unknown action" },
    { status: 400 },
  );
}
