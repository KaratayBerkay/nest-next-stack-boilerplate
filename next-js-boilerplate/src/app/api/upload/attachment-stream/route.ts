import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendStreamFetch } from "@/lib/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import {
  STREAM_CONTENT_TYPE_HEADER,
  STREAM_FILENAME_HEADER,
} from "@/constants/api/headers";
import { MAX_ATTACHMENT_SIZE } from "@/constants/upload";
import { withLogging } from "@/lib/request-logger";

export const POST = withLogging(async (request, log) => {
  const filename = request.headers.get(STREAM_FILENAME_HEADER) ?? "file";
  try {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const announced = Number(request.headers.get("content-length") ?? 0);
    if (announced > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json(
        { msg: "File must be under 10 MB" },
        { status: 413 },
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { msg: "Request body is required" },
        { status: 400 },
      );
    }

    const backend = await backendStreamFetch(
      "/upload/attachment-stream",
      {
        body: request.body,
        duplex: "half",
        headers: {
          "content-type":
            request.headers.get("content-type") ?? "application/octet-stream",
          [STREAM_FILENAME_HEADER]: filename,
          [STREAM_CONTENT_TYPE_HEADER]:
            request.headers.get(STREAM_CONTENT_TYPE_HEADER) ??
            "application/octet-stream",
        },
      },
      accessToken,
    );

    if (!backend.ok) {
      // The backend's GlobalHttpExceptionFilter always shapes rejections as
      // {statusCode, exc, msg, key, ...} — forward its real `msg` instead of
      // a generic string, so the client (and this log line) can show the
      // actual reason (size/MIME/quota/scope validation, etc).
      const backendMsg = (backend.data as { msg?: string } | null)?.msg;
      log.warn(
        { status: backend.status, filename, backendMsg },
        "attachment stream: backend rejected upload",
      );
      return NextResponse.json(
        { msg: backendMsg ?? "Upload failed" },
        { status: backend.status },
      );
    }

    return NextResponse.json(backend.data, { status: 201 });
  } catch (err) {
    // Previously swallowed with no logging at all — a failure here (network
    // error to the backend, a duplex-stream hiccup, anything unexpected)
    // was completely invisible after the fact. Log it so it's diagnosable.
    log.error({ err, filename }, "attachment stream: proxy threw");
    return NextResponse.json({ msg: "Upload failed" }, { status: 500 });
  }
});
