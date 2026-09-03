import { NextResponse } from "next/server";

/**
 * Cheap pre-parse size guard for upload BFF routes. `request.formData()`
 * buffers the entire body into memory BEFORE any per-file size check can
 * run, so an oversized request must be rejected from its declared
 * Content-Length first (browsers always send it for FormData bodies; a
 * chunked request without one falls through to the backend's own hard
 * stream cap — see upload.controller.ts's readBodyStream).
 *
 * Returns a 413 response to short-circuit with, or null to proceed.
 * `maxBytes` should include multipart framing slack on top of the payload
 * limit.
 */
export function oversizedBodyResponse(
  request: Request,
  maxBytes: number,
): NextResponse | null {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  return null;
}

/** Multipart framing overhead allowance (boundaries + part headers). */
export const MULTIPART_SLACK = 1024 * 1024;
