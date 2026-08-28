import { Track, type Room } from "livekit-client";

/**
 * Whether any remote participant currently publishes an unmuted camera
 * track. This is the signal for showing the peer's video element instead of
 * the avatar/name placeholder — a muted or withdrawn camera track otherwise
 * renders as a frozen or black rectangle over the placeholder.
 */
export function hasLiveRemoteCamera(
  room: Pick<Room, "remoteParticipants">,
): boolean {
  for (const p of room.remoteParticipants.values()) {
    for (const pub of p.trackPublications.values()) {
      if (pub.source === Track.Source.Camera && pub.track && !pub.isMuted) {
        return true;
      }
    }
  }
  return false;
}
