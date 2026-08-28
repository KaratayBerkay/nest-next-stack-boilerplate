import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

type Handler = (data: Record<string, unknown>) => void;
const handlers = new Map<string, Handler>();

vi.mock("@/lib/realtime/RealtimeProvider", () => ({
  useRealtime: () => ({
    subscribe: (type: string, cb: Handler) => {
      handlers.set(type, cb);
      return () => handlers.delete(type);
    },
  }),
}));

import { useStreamViewerCount } from "@/hooks/rtc/useStreamViewerCount";

function emit(type: string, data: Record<string, unknown>) {
  act(() => handlers.get(type)?.(data));
}

describe("useStreamViewerCount", () => {
  beforeEach(() => handlers.clear());

  it("seeds from initial and follows joined/left frames that carry a count", () => {
    const { result } = renderHook(() => useStreamViewerCount("slug1", 4));
    expect(result.current).toBe(4);

    emit("rtc:stream-viewer-joined", { slug: "slug1", viewerCount: 5 });
    expect(result.current).toBe(5);

    emit("rtc:stream-viewer-left", { slug: "slug1", viewerCount: 4 });
    expect(result.current).toBe(4);
  });

  it("ignores a left frame WITHOUT a viewerCount — regression: the webhook-driven leave frame omitted it and Number(undefined ?? 0) slammed the visible count to 0 for everyone", () => {
    const { result } = renderHook(() => useStreamViewerCount("slug1", 7));

    emit("rtc:stream-viewer-left", { slug: "slug1", userId: "u9" });

    expect(result.current).toBe(7);
  });

  it("ignores frames for another stream's slug", () => {
    const { result } = renderHook(() => useStreamViewerCount("slug1", 2));

    emit("rtc:stream-viewer-joined", { slug: "other", viewerCount: 99 });

    expect(result.current).toBe(2);
  });
});
