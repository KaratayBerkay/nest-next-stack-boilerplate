import { describe, it, expect } from "vitest";
import {
  resolveByPath,
  exceptionHandler,
  clientException,
  getSurface,
} from "./exception-handler";
import type { ExceptionResponse } from "./api-client";
import type { ExceptionCode } from "./exception-handler";

describe("resolveByPath", () => {
  it("resolves a top-level key", () => {
    expect(resolveByPath({ hello: "world" }, "hello")).toBe("world");
  });

  it("resolves a nested dotted path", () => {
    const obj = { a: { b: { c: "deep" } } };
    expect(resolveByPath(obj, "a.b.c")).toBe("deep");
  });

  it("returns undefined for a missing key", () => {
    expect(resolveByPath({ a: "b" }, "missing")).toBeUndefined();
  });

  it("returns undefined for a missing nested segment", () => {
    expect(resolveByPath({ a: { b: "c" } }, "a.x.y")).toBeUndefined();
  });

  it("returns undefined for a non-string leaf", () => {
    expect(resolveByPath({ a: { b: 42 } }, "a.b")).toBeUndefined();
  });

  it("returns undefined for null or undefined obj", () => {
    expect(resolveByPath(null, "a.b")).toBeUndefined();
    expect(resolveByPath(undefined, "a.b")).toBeUndefined();
  });
});

describe("exceptionHandler", () => {
  const messages = {
    errors: {
      notFound: "Not found",
      conflict: "Already exists",
    },
  };

  it("resolves a matching key from messages", () => {
    const error: ExceptionResponse = {
      statusCode: 404,
      exc: "EX_NOT_FOUND",
      msg: "Not found",
      key: "errors.notFound",
    };
    expect(exceptionHandler(error, messages)).toBe("Not found");
  });

  it("falls back to msg when key does not exist in messages", () => {
    const error: ExceptionResponse = {
      statusCode: 404,
      exc: "EX_NOT_FOUND",
      msg: "Fallback text",
      key: "errors.missing",
    };
    expect(exceptionHandler(error, messages)).toBe("Fallback text");
  });

  it("falls back to msg when no messages block provided", () => {
    const error: ExceptionResponse = {
      statusCode: 500,
      exc: "EX_INTERNAL",
      msg: "Something went wrong",
      key: "error.internal",
    };
    expect(exceptionHandler(error)).toBe("Something went wrong");
  });

  it("handles client exceptions (no statusCode)", () => {
    const error = clientException("EX_WS_UNSTABLE", "Connection lost");
    expect(exceptionHandler(error)).toBe("Connection lost");
  });

  it("resolves client exception key when messages are provided", () => {
    const msgs = { connectionUnstable: "Bağlantı kararsız" };
    const error = clientException(
      "EX_WS_UNSTABLE",
      "Connection unstable",
      "connectionUnstable",
    );
    expect(exceptionHandler(error, msgs)).toBe("Bağlantı kararsız");
  });
});

describe("clientException", () => {
  it("builds a minimal client exception", () => {
    const result = clientException("EX_WS_UNSTABLE", "Connection is unstable.");
    expect(result).toEqual({
      exc: "EX_WS_UNSTABLE",
      msg: "Connection is unstable.",
      key: "error.client_ws_unstable",
    });
  });

  it("accepts an explicit key", () => {
    const result = clientException(
      "EX_WS_UNSTABLE",
      "Connection lost",
      "error.connectionUnstable",
    );
    expect(result.key).toBe("error.connectionUnstable");
  });
});

describe("getSurface", () => {
  it("returns form-field for EX_VALIDATION_FORM", () => {
    expect(getSurface("EX_VALIDATION_FORM")).toBe("form-field");
  });

  it("returns toast for EX_INTERNAL", () => {
    expect(getSurface("EX_INTERNAL")).toBe("toast");
  });

  it("returns full-page for EX_FORBIDDEN", () => {
    expect(getSurface("EX_FORBIDDEN")).toBe("full-page");
  });

  it("returns badge for EX_WS_UNSTABLE", () => {
    expect(getSurface("EX_WS_UNSTABLE")).toBe("badge");
  });

  it("defaults to toast for unknown codes", () => {
    expect(getSurface("EX_UNKNOWN" as ExceptionCode)).toBe("toast");
  });
});
