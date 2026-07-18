import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { POST as POST_METHOD } from "@/constants/api/methods";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5 MB" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.set("file", file);

    const res = await fetch(`${serverEnv().APP_URL}/upload/single`, {
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
