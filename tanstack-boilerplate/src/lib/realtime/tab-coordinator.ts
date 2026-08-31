import type { RealtimeStatus } from "./realtime-client";

const CHANNEL = "rt-coord";

export type Cmd =
  | { type: "frame"; data: Record<string, unknown> }
  | { type: "st"; status: RealtimeStatus }
  /** A tab (re)mounted and needs the leader's current status + presence.
   *  Without this, a follower only ever hears status CHANGES — one that
   *  joins while the leader sits stably "open" would show "waiting"
   *  (disabled chat input, calls refused with realtime_unavailable)
   *  forever, which is exactly the stuck second tab observed live on
   *  2026-08-28 after a call hangup. */
  | { type: "hi" }
  /** Leader's reply to "hi": snapshot of the online-user ids, since the
   *  server only pushes the full online-users list once per socket
   *  lifetime — a late-joining tab never sees that frame. */
  | { type: "presence"; users: string[] }
  | { type: "cmd"; act: string; payload: unknown };

export type ClaimPayload = {
  page: string | null;
  params?: Record<string, string>;
  tabId: string;
};

export function openBc(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}

/** What the leader posts back when any tab says "hi". */
export function leaderSnapshotReply(
  status: RealtimeStatus,
  onlineUsers: ReadonlySet<string>,
): Cmd[] {
  return [
    { type: "st", status },
    { type: "presence", users: [...onlineUsers] },
  ];
}

/** The deferred "waiting" placeholder must never clobber a status that
 *  already arrived (the leader's snapshot reply, or a previous run's last
 *  known state) — it only fills the true blank-slate case. */
export function waitingFallback(prev: RealtimeStatus): RealtimeStatus {
  return prev === "idle" ? "waiting" : prev;
}

/** A follower receiving the leader's presence snapshot re-emits it locally
 *  in the server's own online-users frame shape, so it flows through the
 *  exact dispatch path a real snapshot would — updating the presence cache
 *  AND every subscribed usePresence hook. (Updating only the cache left
 *  hooks that had already seeded from the then-empty cache showing everyone
 *  offline until a presence delta happened to arrive.) */
export function presenceSnapshotFrame(users: string[]): {
  type: "online-users";
  users: { id: string }[];
} {
  return { type: "online-users", users: users.map((id) => ({ id })) };
}
