import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFormFetch } from "@/lib/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { POST as POST_METHOD } from "@/constants/api/methods";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE,
  MAX_UPLOAD_SIZE_MB,
} from "@/constants/upload";
import { oversizedBodyResponse, MULTIPART_SLACK } from "@/lib/body-limit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tooLarge = oversizedBodyResponse(request, MAX_UPLOAD_SIZE * 10 + MULTIPART_SLACK);
    if (tooLarge) return tooLarge;

    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return NextResponse.json(
        { error: "At least one file is required" },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Invalid file entry" },
          { status: 400 },
        );
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File "${file.name}" has unsupported type. Only JPEG, PNG, WebP, GIF, and AVIF images are allowed`,
          },
          { status: 400 },
        );
      }
      if (file.size > MAX_UPLOAD_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" must be under ${MAX_UPLOAD_SIZE_MB} MB`,
          },
          { status: 400 },
        );
      }
    }

    const backendFormData = new FormData();
    for (const file of files) {
      backendFormData.append("files", file as File);
    }

    const backend = await backendFormFetch(
      "/upload/multiple",
      backendFormData,
      { method: POST_METHOD },
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
        route: "upload/multiple",
        category: "network",
        event: "upload.failed",
        err: err instanceof Error ? err.message : String(err),
      },
      "upload: unexpected failure",
    );
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
