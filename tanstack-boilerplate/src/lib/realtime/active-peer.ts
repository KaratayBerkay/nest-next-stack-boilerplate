// Module-global "which DM thread is open right now" signal, set by the
// messages page on selection and cleared on leave. Lives in its own module
// because both event-dispatch (auto-mark-read, echo peer fallback) and
// renew-dispatch (unread clamping) need it, and event-dispatch already
// imports from renew-dispatch — housing it in either would force a cycle.
let activePeerId: string | null = null;

export function setActivePeerId(peerId: string | null): void {
  activePeerId = peerId;
}

// The open-thread signal for UI that must not treat a visible conversation
// as "new mail" (e.g. the header dropdown's auto-pop, unread badges). URL
// parsing can't answer this: sidebar clicks select a peer in component
// state without writing ?user= to the URL.
export function getActivePeerId(): string | null {
  return activePeerId;
}
