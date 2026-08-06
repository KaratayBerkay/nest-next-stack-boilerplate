import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendStreamFetch } from "@/lib/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import {
  STREAM_CONTENT_TYPE_HEADER,
  STREAM_FILENAME_HEADER,
} from "@/constants/api/headers";
import { MAX_ATTACHMENT_SIZE } from "@/constants/upload";

export async function POST(request: Request) {
  try {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announced = Number(request.headers.get("content-length") ?? 0);
    if (announced > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json(
        { error: "File must be under 10 MB" },
        { status: 413 },
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "Request body is required" },
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
          [STREAM_FILENAME_HEADER]:
            request.headers.get(STREAM_FILENAME_HEADER) ?? "file",
          [STREAM_CONTENT_TYPE_HEADER]:
            request.headers.get(STREAM_CONTENT_TYPE_HEADER) ??
            "application/octet-stream",
        },
      },
      accessToken,
    );

    if (!backend.ok) {
      return NextResponse.json(
        { error: "Upload failed" },
        { status: backend.status },
      );
    }

    return NextResponse.json(backend.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
