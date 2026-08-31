import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// This setup file runs for every test file, including ones that opt into
// the plain `node` environment (e.g. via a `// @vitest-environment node`
// comment, for server-only code that guards against a `window` global being
// present). Everything below is jsdom-specific — skip it there instead of
// throwing on a `window` that was never supposed to exist.
if (typeof window !== "undefined") {
  // Unmount React trees between tests so the jsdom DOM doesn't leak across cases.
  afterEach(() => cleanup());

  // jsdom doesn't implement ResizeObserver; select, combobox, and other components depend on it.
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver ??=
    ResizeObserverMock as unknown as typeof ResizeObserver;

  // jsdom doesn't implement matchMedia; useDeviceType and other hooks depend on it.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(pointer: fine)" || query === "(min-width: 640px)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
