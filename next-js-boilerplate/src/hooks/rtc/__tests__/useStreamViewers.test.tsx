import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

type Handler = (data: Record<string, unknown>) => void;
const handlers = new Map<string, Handler>();
let currentStatus: string | null = "open";

vi.mock("@/lib/realtime/RealtimeProvider", () => ({
  useRealtime: () => ({
    subscribe: (type: string, cb: Handler) => {
      handlers.set(type, cb);
      return () => handlers.delete(type);
    },
  }),
  useRealtimeStatus: () => currentStatus,
}));

const getStreamViewersServer = vi.fn().mockResolvedValue([]);
vi.mock("@/api/server/rtc/streams/viewers", () => ({
  getStreamViewersServer: (slug: string) => getStreamViewersServer(slug),
}));

import {
  useStreamViewers,
  VIEWER_REFETCH_DEBOUNCE_MS,
} from "@/hooks/rtc/useStreamViewers";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function emit(type: string, data: Record<string, unknown>) {
  act(() => handlers.get(type)?.(data));
}

async function flushDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(VIEWER_REFETCH_DEBOUNCE_MS + 10);
  });
}

describe("useStreamViewers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    handlers.clear();
    currentStatus = "open";
    getStreamViewersServer.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches exactly once on mount when the socket is already open — the status effect must not duplicate (cancel + restart) the query's own initial fetch", async () => {
    renderHook(() => useStreamViewers("slug1"), { wrapper });
    await flushDebounce();

    expect(getStreamViewersServer).toHaveBeenCalledTimes(1);
    expect(getStreamViewersServer).toHaveBeenCalledWith("slug1");
  });

  it("coalesces a burst of joined/left frames into ONE refetch — without the debounce every watching client re-queried once per frame (N viewers × M churn events)", async () => {
    renderHook(() => useStreamViewers("slug1"), { wrapper });
    await flushDebounce();
    getStreamViewersServer.mockClear();

    emit("rtc:stream-viewer-joined", { slug: "slug1", userId: "a" });
    emit("rtc:stream-viewer-joined", { slug: "slug1", userId: "b" });
    emit("rtc:stream-viewer-left", { slug: "slug1", userId: "a" });
    emit("rtc:stream-viewer-joined", { slug: "slug1", userId: "c" });
    await flushDebounce();

    expect(getStreamViewersServer).toHaveBeenCalledTimes(1);

    // A later, separate frame still triggers its own refetch.
    emit("rtc:stream-viewer-left", { slug: "slug1", userId: "b" });
    await flushDebounce();
    expect(getStreamViewersServer).toHaveBeenCalledTimes(2);
  });

  it("ignores frames for another stream's slug", async () => {
    renderHook(() => useStreamViewers("slug1"), { wrapper });
    await flushDebounce();
    getStreamViewersServer.mockClear();

    emit("rtc:stream-viewer-joined", { slug: "other", userId: "x" });
    await flushDebounce();

    expect(getStreamViewersServer).not.toHaveBeenCalled();
  });

  it("refetches when the socket comes back after a gap (closed → open) so joins/leaves missed during the outage are picked up", async () => {
    const { rerender } = renderHook(() => useStreamViewers("slug1"), {
      wrapper,
    });
    await flushDebounce();
    getStreamViewersServer.mockClear();

    currentStatus = "closed";
    rerender();
    currentStatus = "open";
    rerender();
    await flushDebounce();

    expect(getStreamViewersServer).toHaveBeenCalledTimes(1);
  });

  it("never fetches with an empty slug (the go-live page mounts with '' until the stream starts)", async () => {
    renderHook(() => useStreamViewers(""), { wrapper });
    await flushDebounce();

    currentStatus = "closed";
    currentStatus = "open";
    await flushDebounce();

    expect(getStreamViewersServer).not.toHaveBeenCalled();
  });
});
