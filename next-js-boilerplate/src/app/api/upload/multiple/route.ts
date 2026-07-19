import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { POST as POST_METHOD } from "@/constants/api/methods";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files.length) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    for (const file of files) {
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Invalid file entry" }, { status: 400 });
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" has unsupported type. Only JPEG, PNG, WebP, and GIF images are allowed` },
          { status: 400 },
        );
      }
      if (file.size > MAX_UPLOAD_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" must be under 5 MB` },
          { status: 400 },
        );
      }
    }

    const backendFormData = new FormData();
    for (const file of files) {
      backendFormData.append("files", file as File);
    }

    const res = await fetch(`${serverEnv().APP_URL}/upload/multiple`, {
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
