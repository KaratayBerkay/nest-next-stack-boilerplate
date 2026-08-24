import type { useQueryClient } from "@tanstack/react-query";

export function resyncAfterConnect(
  qc: ReturnType<typeof useQueryClient>,
  currentClaim: { page: string | null; params?: Record<string, string> } | null,
): void {
  qc.invalidateQueries({ queryKey: ["conversations"] });
  qc.invalidateQueries({ queryKey: ["friends", "list"] });
  qc.invalidateQueries({ queryKey: ["notifications", "list"] });
  qc.invalidateQueries({ queryKey: ["notifications", "count"] });
  qc.invalidateQueries({ queryKey: ["notifications", "dm-count"] });
  // Recovers a ringing/connected call whose point-in-time rtc:invite/
  // rtc:accepted push landed during the connection gap.
  qc.invalidateQueries({ queryKey: ["rtc", "active-call"] });

  if (currentClaim?.page === "feed") {
    qc.invalidateQueries({ queryKey: ["feed"] });
  } else if (currentClaim?.page === "post" && currentClaim.params?.id) {
    qc.invalidateQueries({ queryKey: ["posts", currentClaim.params.id] });
  } else if (currentClaim?.page === "messages" && currentClaim.params?.peer) {
    qc.invalidateQueries({
      queryKey: ["messages", currentClaim.params.peer],
    });
  } else if (currentClaim?.page === "chat-room" && currentClaim.params?.room) {
    qc.invalidateQueries({
      queryKey: ["room", currentClaim.params.room],
    });
  }
}
