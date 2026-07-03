import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const MINIO_URL = serverEnv().MINIO_URL;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const objectPath = path.join("/");

  try {
    const res = await fetch(`${MINIO_URL}/uploads/${objectPath}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: res.status });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      res.headers.get("Content-Type") ?? "image/webp",
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(res.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
