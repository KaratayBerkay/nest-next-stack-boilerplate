import { Track, type Room } from "livekit-client";

function hasLiveRemoteTrack(
  room: Pick<Room, "remoteParticipants">,
  source: Track.Source,
): boolean {
  for (const p of room.remoteParticipants.values()) {
    for (const pub of p.trackPublications.values()) {
      if (pub.source === source && pub.track && !pub.isMuted) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Whether any remote participant currently publishes an unmuted camera
 * track. This is the signal for showing the peer's video element instead of
 * the avatar/name placeholder — a muted or withdrawn camera track otherwise
 * renders as a frozen or black rectangle over the placeholder.
 */
export function hasLiveRemoteCamera(
  room: Pick<Room, "remoteParticipants">,
): boolean {
  return hasLiveRemoteTrack(room, Track.Source.Camera);
}

/** Same signal as {@link hasLiveRemoteCamera}, but for a peer's screen
 *  share — gates showing their shared screen as the call's main stage. */
export function hasLiveRemoteScreenShare(
  room: Pick<Room, "remoteParticipants">,
): boolean {
  return hasLiveRemoteTrack(room, Track.Source.ScreenShare);
}
