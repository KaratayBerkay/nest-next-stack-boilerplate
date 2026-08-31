import { NextResponse } from "next/server";
import { getAccessToken } from "@/store/ssr-cookies";
import { csrfEchoHeaders, graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import {
  MEETING_RECORDING_QUERY,
  START_MEETING_RECORDING_MUTATION,
  STOP_MEETING_RECORDING_MUTATION,
} from "@/lib/graphql/rtc";
import type { RtcRecordingView } from "@/api/server/rtc/shared-types";

// Scaffolding only (Phase 5) — see RtcRecordingService's doc comment. This
// route persists start/stop intent; it never starts a real LiveKit Egress
// process.
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
    meetingRecording: RtcRecordingView | null;
  }>(MEETING_RECORDING_QUERY, { slug }, accessToken, undefined, true);
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load recording status");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(data?.meetingRecording ?? null);
}

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
  const { action } = await req.json();
  const mutation =
    action === "start"
      ? START_MEETING_RECORDING_MUTATION
      : action === "stop"
        ? STOP_MEETING_RECORDING_MUTATION
        : null;
  if (!mutation) {
    return NextResponse.json(
      { statusCode: 400, msg: "Unknown action" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<Record<string, RtcRecordingView>>(
    mutation,
    { slug },
    accessToken,
    extraHeaders,
  );
  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to update recording");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json(
    data?.startMeetingRecording ?? data?.stopMeetingRecording ?? { ok: true },
  );
}
