import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFormFetch } from "@/lib/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { POST as POST_METHOD } from "@/constants/api/methods";
import { MAX_ATTACHMENT_SIZE } from "@/constants/upload";

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

    const backend = await backendFormFetch(
      "/upload/attachment",
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
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
