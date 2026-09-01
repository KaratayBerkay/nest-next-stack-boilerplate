import { describe, it, expect } from "vitest";
import { Track, type Room } from "livekit-client";
import { hasLiveRemoteCamera, hasLiveRemoteScreenShare } from "./remote-camera";

type Pub = { source: Track.Source; track: object | null; isMuted: boolean };

function roomWith(pubs: Pub[]): Pick<Room, "remoteParticipants"> {
  return {
    remoteParticipants: new Map([
      [
        "peer",
        {
          trackPublications: new Map(pubs.map((p, i) => [`t${i}`, p])),
        },
      ],
    ]),
  } as unknown as Pick<Room, "remoteParticipants">;
}

// Regression for the black/frozen remote tile of 2026-08-28: the video
// element must only be treated as live while an unmuted camera track is
// actually publishing.
describe("hasLiveRemoteCamera", () => {
  it("is live for an unmuted camera track", () => {
    expect(
      hasLiveRemoteCamera(
        roomWith([{ source: Track.Source.Camera, track: {}, isMuted: false }]),
      ),
    ).toBe(true);
  });

  it("is not live when the camera track is muted (peer turned camera off)", () => {
    expect(
      hasLiveRemoteCamera(
        roomWith([{ source: Track.Source.Camera, track: {}, isMuted: true }]),
      ),
    ).toBe(false);
  });

  it("is not live when the publication has no track yet", () => {
    expect(
      hasLiveRemoteCamera(
        roomWith([
          { source: Track.Source.Camera, track: null, isMuted: false },
        ]),
      ),
    ).toBe(false);
  });

  it("ignores non-camera tracks (microphone, screen share)", () => {
    expect(
      hasLiveRemoteCamera(
        roomWith([
          { source: Track.Source.Microphone, track: {}, isMuted: false },
          { source: Track.Source.ScreenShare, track: {}, isMuted: false },
        ]),
      ),
    ).toBe(false);
  });

  it("is not live with no remote participants at all", () => {
    expect(
      hasLiveRemoteCamera({
        remoteParticipants: new Map(),
      } as unknown as Pick<Room, "remoteParticipants">),
    ).toBe(false);
  });
});

// Same mechanics as hasLiveRemoteCamera, gating the call overlay's screen
// share main stage instead of the camera tile.
describe("hasLiveRemoteScreenShare", () => {
  it("is live for an unmuted screen share track", () => {
    expect(
      hasLiveRemoteScreenShare(
        roomWith([
          { source: Track.Source.ScreenShare, track: {}, isMuted: false },
        ]),
      ),
    ).toBe(true);
  });

  it("is not live when the screen share track is muted", () => {
    expect(
      hasLiveRemoteScreenShare(
        roomWith([
          { source: Track.Source.ScreenShare, track: {}, isMuted: true },
        ]),
      ),
    ).toBe(false);
  });

  it("ignores non-screen-share tracks (camera, microphone)", () => {
    expect(
      hasLiveRemoteScreenShare(
        roomWith([
          { source: Track.Source.Camera, track: {}, isMuted: false },
          { source: Track.Source.Microphone, track: {}, isMuted: false },
        ]),
      ),
    ).toBe(false);
  });
});
