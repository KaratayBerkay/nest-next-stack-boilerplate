import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.set("file", file);

    const res = await fetch(`${serverEnv().APP_URL}/upload/single`, {
      method: "POST",
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
