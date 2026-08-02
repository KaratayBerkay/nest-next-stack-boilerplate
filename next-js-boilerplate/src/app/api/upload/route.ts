import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFormFetch } from "@/lib/backend";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { POST as POST_METHOD } from "@/constants/api/methods";
import { MAX_UPLOAD_SIZE } from "@/constants/upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5 MB" },
        { status: 400 },
      );
    }

    const backendFormData = new FormData();
    backendFormData.set("file", file);

    const backend = await backendFormFetch(
      "/upload/single",
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
