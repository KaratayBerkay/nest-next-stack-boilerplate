import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
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

    const res = await fetch(`${serverEnv().APP_URL}/upload/attachment`, {
      method: POST_METHOD,
      body: backendFormData,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upload failed" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
