import { describe, it, expect, vi } from "vitest";
import { blurAsyncCheck } from "./blur-async-check";
import type { ExceptionResponse } from "@/lib/api-client";

function makeDeps() {
  return {
    simulateError: vi.fn(),
    toast: vi.fn(),
    allMessages: {},
  };
}

describe("blurAsyncCheck", () => {
  it("returns undefined when simulateError succeeds", async () => {
    const deps = makeDeps();
    deps.simulateError.mockResolvedValue({});

    const result = await blurAsyncCheck("test", "scenario", deps);

    expect(result).toBeUndefined();
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it("calls toast and returns undefined for toast-surface exceptions", async () => {
    const deps = makeDeps();
    deps.simulateError.mockRejectedValue({
      exception: {
        statusCode: 500,
        exc: "EX_INTERNAL",
        msg: "Internal error",
        key: "errors.internal",
      } satisfies ExceptionResponse,
    });

    const result = await blurAsyncCheck("test", "scenario", deps);

    expect(result).toBeUndefined();
    expect(deps.toast).toHaveBeenCalledWith({
      description: "Internal error",
      variant: "destructive",
    });
  });

  it("returns first field error for form-field-surface exceptions", async () => {
    const deps = makeDeps();
    deps.simulateError.mockRejectedValue({
      exception: {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Validation failed",
        key: "errors.validation",
        fields: [
          { field: "slug", msg: "This slug is already in use", key: "forms.errors.slugTaken" },
        ],
      } satisfies ExceptionResponse,
    });

    const result = await blurAsyncCheck("test", "scenario", deps);

    expect(result).toBe("This slug is already in use");
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it("returns undefined when caught error has no exception property", async () => {
    const deps = makeDeps();
    deps.simulateError.mockRejectedValue(new Error("Network error"));

    const result = await blurAsyncCheck("test", "scenario", deps);

    expect(result).toBeUndefined();
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it("returns undefined when exception has no fields", async () => {
    const deps = makeDeps();
    deps.simulateError.mockRejectedValue({
      exception: {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Validation failed",
        key: "errors.validation",
      } satisfies ExceptionResponse,
    });

    const result = await blurAsyncCheck("test", "scenario", deps);

    expect(result).toBeUndefined();
    expect(deps.toast).not.toHaveBeenCalled();
  });
});
