import { NextResponse } from "next/server";

// Route Handler: this segment exports HTTP-verb functions instead of a default
// page component. Handlers receive the Web-standard `Request` and return a
// `Response` (NextResponse extends it).

// GET echoes a query param as JSON.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "world";
  return NextResponse.json({ method: "GET", hello: name });
}

// POST parses the JSON body and echoes it back with a 201.
export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ method: "POST", received: body }, { status: 201 });
}
