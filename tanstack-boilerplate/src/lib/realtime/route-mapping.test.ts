import { describe, it, expect } from "vitest";
import { routeToPageClaim } from "./route-mapping";

describe("routeToPageClaim", () => {
  it("returns null page for null pathname", () => {
    expect(routeToPageClaim(null, null)).toEqual({ page: null });
  });

  it("maps messages route with a peer", () => {
    const sp = new URLSearchParams("user=peer-1");
    expect(routeToPageClaim("/v1/en/messages", sp)).toEqual({
      page: "messages",
      params: { peer: "peer-1" },
    });
  });

  it("maps chat-room route with a room", () => {
    const sp = new URLSearchParams("room=general");
    expect(routeToPageClaim("/v1/en/chat-room", sp)).toEqual({
      page: "chat-room",
      params: { room: "general" },
    });
  });

  it("maps rtc/meetings/[slug] to an rtc-meeting claim", () => {
    expect(routeToPageClaim("/v1/en/rtc/meetings/abc-123", null)).toEqual({
      page: "rtc-meeting",
      params: { slug: "abc-123" },
    });
  });

  it("returns null page for rtc/meetings/ with no slug", () => {
    expect(routeToPageClaim("/v1/en/rtc/meetings", null)).toEqual({
      page: null,
    });
  });

  it("maps rtc/live/[slug] to an rtc-stream claim", () => {
    expect(routeToPageClaim("/v1/en/rtc/live/xyz-789", null)).toEqual({
      page: "rtc-stream",
      params: { slug: "xyz-789" },
    });
  });

  it("excludes the static go-live setup route from the dynamic [slug] mapping", () => {
    expect(routeToPageClaim("/v1/en/rtc/live/go-live", null)).toEqual({
      page: null,
    });
  });

  it("returns null page for an unrecognized route", () => {
    expect(routeToPageClaim("/v1/en/settings", null)).toEqual({
      page: null,
    });
  });
});
