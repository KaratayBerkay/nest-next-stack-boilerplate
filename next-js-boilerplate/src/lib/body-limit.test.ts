// @vitest-environment node
import { describe, it, expect } from "vitest";
import { oversizedBodyResponse, MULTIPART_SLACK } from "./body-limit";

// Regression: request.formData() buffers the whole body into memory before
// any per-file size check runs — the declared Content-Length must gate first.
describe("oversizedBodyResponse", () => {
  const max = 10 * 1024 * 1024 + MULTIPART_SLACK;

  function req(len?: string) {
    return new Request("http://localhost/api/upload", {
      method: "POST",
      headers: len === undefined ? {} : { "content-length": len },
    });
  }

  it("413s a declared body over the limit", async () => {
    const res = oversizedBodyResponse(req(String(max + 1)), max);
    expect(res?.status).toBe(413);
  });

  it("passes a body at the limit", () => {
    expect(oversizedBodyResponse(req(String(max)), max)).toBeNull();
  });

  it("passes when Content-Length is absent (backend stream cap is the backstop)", () => {
    expect(oversizedBodyResponse(req(undefined), max)).toBeNull();
  });
});
