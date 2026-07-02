import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: 1,
    name: "Data from Server",
    nested: { value: 42 },
  });
}
