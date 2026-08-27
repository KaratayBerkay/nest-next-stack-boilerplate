import { describe, it, expect, beforeEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { vi } from "vitest";
import { resyncAfterConnect } from "./resync";

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("resyncAfterConnect", () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = createQueryClient();
  });

  it("always invalidates the baseline conversation/notification/call queries", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    resyncAfterConnect(qc, null);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["conversations"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["friends", "list"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["notifications", "list"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["notifications", "count"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["notifications", "dm-count"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["rtc", "active-call"],
    });
  });

  it("invalidates the meeting chat query for an rtc-meeting claim", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    resyncAfterConnect(qc, {
      page: "rtc-meeting",
      params: { slug: "meeting-1" },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["rtc", "meetings", "meeting-1", "chat"],
    });
  });

  it("invalidates the stream chat query for an rtc-stream claim", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    resyncAfterConnect(qc, {
      page: "rtc-stream",
      params: { slug: "stream-1" },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["rtc", "streams", "stream-1", "chat"],
    });
  });

  it("does not invalidate rtc chat queries when the slug param is missing", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    resyncAfterConnect(qc, { page: "rtc-meeting" });

    expect(invalidateSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(["meetings"]),
      }),
    );
  });

  it("invalidates the room query for a chat-room claim", () => {
    const invalidateSpy = vi.spyOn(qc, "invalidateQueries");

    resyncAfterConnect(qc, { page: "chat-room", params: { room: "general" } });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["room", "general"],
    });
  });
});
