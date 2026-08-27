import { describe, it, expect } from "vitest";
import { deviceLabel } from "./device-label";

describe("deviceLabel", () => {
  it("parses Chrome on macOS", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
        undefined,
        "Unknown device",
      ),
    ).toBe("Chrome on macOS");
  });

  it("parses Safari on macOS, not Chrome (Safari UAs also contain the token 'Safari/')", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Safari/605.1.15",
        undefined,
        "Unknown device",
      ),
    ).toBe("Safari on macOS");
  });

  it("parses Firefox on Linux", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0",
        undefined,
        "Unknown device",
      ),
    ).toBe("Firefox on Linux");
  });

  it("parses Chrome on Linux — this is the exact UA that used to render as the cut-off 'Mozilla/5.0 (X11; Ubuntu;'", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        undefined,
        "Unknown device",
      ),
    ).toBe("Chrome on Linux");
  });

  it("parses Edge, not Chrome (Edge UAs also contain the token 'Chrome/')", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
        undefined,
        "Unknown device",
      ),
    ).toBe("Edge on Windows");
  });

  it("parses mobile Safari on iOS", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
        undefined,
        "Unknown device",
      ),
    ).toBe("Safari on iOS");
  });

  it("labels a server-side/API call as 'API client', matching the literal 'node' UA this backend sends", () => {
    expect(deviceLabel("node", undefined, "Unknown device")).toBe("API client");
  });

  it("falls back to deviceType, then the caller-supplied unknown-device label, when there's nothing to parse", () => {
    expect(deviceLabel(undefined, "DESKTOP", "Unknown device")).toBe("DESKTOP");
    expect(deviceLabel(undefined, undefined, "Unknown device")).toBe(
      "Unknown device",
    );
    expect(deviceLabel(undefined, undefined, "Bilinmeyen cihaz")).toBe(
      "Bilinmeyen cihaz",
    );
  });
});
