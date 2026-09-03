import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFormFetch } from "@/lib/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  UPLOAD_SCOPE_ID_HEADER,
  UPLOAD_SCOPE_KIND_HEADER,
} from "@/constants/api/headers";
import { MAX_ATTACHMENT_SIZE } from "@/constants/upload";
import { oversizedBodyResponse, MULTIPART_SLACK } from "@/lib/body-limit";
import { logger } from "@/lib/logger";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export async function POST(request: Request) {
  try {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tooLarge = oversizedBodyResponse(request, MAX_ATTACHMENT_SIZE + MULTIPART_SLACK);
    if (tooLarge) return tooLarge;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only images, PDF, DOC, DOCX, and TXT files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json(
        { error: "File must be under 10 MB" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.set("file", file);

    const scopeKind = request.headers.get(UPLOAD_SCOPE_KIND_HEADER);
    const scopeId = request.headers.get(UPLOAD_SCOPE_ID_HEADER);

    const backend = await backendFormFetch(
      "/upload/attachment",
      backendFormData,
      {
        method: POST_METHOD,
        headers: {
          ...(scopeKind ? { [UPLOAD_SCOPE_KIND_HEADER]: scopeKind } : {}),
          ...(scopeId ? { [UPLOAD_SCOPE_ID_HEADER]: scopeId } : {}),
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
  } catch (err) {
    logger.error(
      {
        route: "upload/attachment",
        category: "network",
        event: "upload.failed",
        err: err instanceof Error ? err.message : String(err),
      },
      "upload: unexpected failure",
    );
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
