import { describe, it, expect, vi, afterEach } from "vitest";
import { handleTriggerErrorLab } from "./trigger-handler";
import type { ExceptionResponse } from "@/lib/api-client";

function makeDeps(
  overrides: Partial<Parameters<typeof handleTriggerErrorLab>[0]> = {},
) {
  return {
    selectedScenario: "scenario-1",
    locale: "en",
    network: "timeout",
    simulateError: vi.fn(),
    toast: vi.fn(),
    allMessages: {},
    errorMessagesByLocale: {},
    setResult: vi.fn(),
    setFormError: vi.fn(),
    setLoading: vi.fn(),
    ...overrides,
  };
}

describe("handleTriggerErrorLab: timeout scenario", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("surfaces the timeout error at 5s, without waiting for the 6s simulateError call to settle", async () => {
    vi.useFakeTimers();
    let backendSettled = false;
    const simulateError = vi.fn(
      (): Promise<ExceptionResponse> =>
        new Promise((resolve) => {
          setTimeout(() => {
            backendSettled = true;
            resolve({ statusCode: 200, exc: "ok", msg: "", key: "" });
          }, 6000);
        }),
    );
    const deps = makeDeps({ simulateError });

    const run = handleTriggerErrorLab(deps);
    await vi.advanceTimersByTimeAsync(5000);
    await run;

    expect(backendSettled).toBe(false);
    expect(deps.toast).toHaveBeenCalledWith({
      description: "Request timed out",
      variant: "destructive",
    });
    expect(deps.setLoading).toHaveBeenLastCalledWith(false);
  });

  it("does not fire the timeout path if simulateError resolves before 5s", async () => {
    vi.useFakeTimers();
    const simulateError = vi.fn((): Promise<ExceptionResponse> =>
      Promise.resolve({ statusCode: 200, exc: "ok", msg: "", key: "" }),
    );
    const deps = makeDeps({ simulateError });

    const run = handleTriggerErrorLab(deps);
    await vi.advanceTimersByTimeAsync(0);
    await run;

    expect(deps.toast).not.toHaveBeenCalled();
    expect(deps.setLoading).toHaveBeenLastCalledWith(false);
  });
});
