import { describe, it, expect } from "vitest";
import {
  leaderSnapshotReply,
  presenceSnapshotFrame,
  waitingFallback,
} from "./tab-coordinator";
import type { RealtimeStatus } from "./realtime-client";

// Regression for the stuck-second-tab incident of 2026-08-28: a follower tab
// that (re)mounted while the leader sat stably "open" stayed at "waiting"
// forever — status was only ever broadcast on changes, so the chat input
// showed "Connecting…" and every call attempt failed realtime_unavailable
// until the leader tab was closed. The snapshot protocol below is what a
// late-joining tab now syncs from.
describe("leaderSnapshotReply", () => {
  it("replies with the leader's current status and the full presence set", () => {
    const replies = leaderSnapshotReply("open", new Set(["u1", "u2"]));

    expect(replies).toContainEqual({ type: "st", status: "open" });
    const presence = replies.find((r) => r.type === "presence");
    expect(presence).toBeTruthy();
    expect(
      (presence as { type: "presence"; users: string[] }).users.sort(),
    ).toEqual(["u1", "u2"]);
  });

  it("relays a non-open status truthfully so followers show the real state", () => {
    const replies = leaderSnapshotReply("backoff", new Set());
    expect(replies).toContainEqual({ type: "st", status: "backoff" });
  });
});

describe("presenceSnapshotFrame", () => {
  // A follower must re-emit the leader's presence snapshot through the same
  // dispatch path as a real server frame. usePresence subscribes to
  // "online-users" and reads `users: {id}[]` — if the shapes ever diverge,
  // hooks already mounted when the snapshot lands go back to showing
  // everyone offline (the second-tab /messages regression).
  it("produces the server's online-users frame shape", () => {
    expect(presenceSnapshotFrame(["u1", "u2"])).toEqual({
      type: "online-users",
      users: [{ id: "u1" }, { id: "u2" }],
    });
  });

  it("maps an empty snapshot to an empty users list, not a missing field", () => {
    expect(presenceSnapshotFrame([]).users).toEqual([]);
  });
});

describe("waitingFallback", () => {
  it("fills the blank slate with waiting", () => {
    expect(waitingFallback("idle")).toBe("waiting");
  });

  it("never clobbers a status that already arrived (snapshot reply or a live client transition)", () => {
    const arrived: RealtimeStatus[] = [
      "open",
      "connecting",
      "authenticating",
      "backoff",
      "down",
      "waiting",
    ];
    for (const s of arrived) expect(waitingFallback(s)).toBe(s);
  });
});
