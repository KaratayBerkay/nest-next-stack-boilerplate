import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { useCurrencyCookie } from "./useCurrencyCookie";

afterEach(() => {
  document.cookie = "currency=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
});

describe("useCurrencyCookie", () => {
  // Testing-library's renderHook flushes effects synchronously as part of
  // the initial act(), so the pre-effect (would-be SSR) render value isn't
  // independently observable here — the fix (matching the already-shipped
  // useDateDisplayCookie pattern of starting at the default and correcting
  // in an effect, rather than eager-reading document.cookie in the useState
  // initializer) is verified by direct code inspection instead.

  it("corrects to the real cookie value immediately after mount", async () => {
    document.cookie = "currency=EUR";

    const { result } = renderHook(() => useCurrencyCookie());

    await waitFor(() => expect(result.current).toBe("EUR"));
  });

  it("stays at the default when no currency cookie is set", async () => {
    const { result } = renderHook(() => useCurrencyCookie());

    await waitFor(() => expect(result.current).toBe("USD"));
  });
});
