"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  ConnectionQuality,
  type RoomOptions,
  type TrackPublication,
  type RemoteTrack,
} from "livekit-client";
import { clientEnv } from "@/lib/env";

export interface UseLiveKitRoomElements {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export interface UseLiveKitRoomResult {
  connected: boolean;
  remoteConnected: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
}

function attachCameraTrack(pub: TrackPublication, el: HTMLVideoElement | null) {
  if (pub.track && pub.source === Track.Source.Camera && el) {
    pub.track.attach(el);
  }
}

function attachRemoteTrack(track: RemoteTrack, el: HTMLMediaElement | null) {
  if (el) track.attach(el);
}

/**
 * Thin wrapper around livekit-client's low-level Room API — no
 * @livekit/components-react, matching this repo's own custom-component
 * culture. `token` is minted server-side by the WebSocket gateway.
 *
 * Video/audio element refs are created by the caller (RtcCallOverlay) and
 * passed in — react-compiler doesn't allow hook returns that mix refs with
 * reactive state, so we keep them on the call-site side.
 *
 * Key design decisions:
 * - Room creation + connect is driven ONLY by `token` (via useEffect dep).
 *   Mic/camera are toggled *after* connect without re-creating the room.
 * - `TrackSubscribed` handles both local and remote tracks generically.
 * - `LocalTrackPublished`/`LocalTrackUnpublished` ensure the local camera
 *   video element stays in sync across toggle cycles.
 * - A `disposed` flag prevents a stale async connect from clobbering state.
 */
export function useLiveKitRoom(
  token: string | null,
  hasVideo: boolean,
  elements: UseLiveKitRoomElements,
): UseLiveKitRoomResult {
  const { localVideoRef, remoteVideoRef, remoteAudioRef } = elements;
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(hasVideo);
  const cameraRef = useRef(hasVideo);

  useEffect(() => {
    cameraRef.current = cameraEnabled;
  }, [cameraEnabled]);

  /** Re-scan the remote participant's tracks and attach any that are missing
   *  from the DOM — called after reconnection to recover lost media. */
  const reattachRemoteTracks = useCallback(
    (room: Room) => {
      for (const p of room.remoteParticipants.values()) {
        for (const pub of p.trackPublications.values()) {
          if (!pub.track) continue;
          if (pub.kind === Track.Kind.Audio) {
            attachRemoteTrack(pub.track, remoteAudioRef.current);
          } else if (
            pub.kind === Track.Kind.Video &&
            pub.source === Track.Source.Camera
          ) {
            attachRemoteTrack(pub.track, remoteVideoRef.current);
          }
        }
      }
    },
    [remoteAudioRef, remoteVideoRef],
  );

  useEffect(() => {
    const url = clientEnv.NEXT_PUBLIC_LIVEKIT_URL;
    if (!token || !url) return;

    const roomOpts: RoomOptions = {
      adaptiveStream: true,
      dynacast: true,
    };
    const room = new Room(roomOpts);
    roomRef.current = room;
    let disposed = false;

    room
      .on(RoomEvent.TrackSubscribed, (track) => {
        attachRemoteTrack(
          track,
          track.kind === Track.Kind.Audio
            ? remoteAudioRef.current
            : remoteVideoRef.current,
        );
      })
      .on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach();
      })
      .on(RoomEvent.TrackSubscriptionFailed, (trackSid) => {
        console.warn(
          "[useLiveKitRoom] Track subscription failed for",
          trackSid,
        );
      })
      .on(RoomEvent.LocalTrackPublished, (pub) => {
        attachCameraTrack(pub, localVideoRef.current);
      })
      .on(RoomEvent.LocalTrackUnpublished, (pub) => {
        if (pub.track && pub.source === Track.Source.Camera) {
          pub.track.detach();
        }
      })
      .on(RoomEvent.ParticipantConnected, () => setRemoteConnected(true))
      .on(RoomEvent.ParticipantDisconnected, () => setRemoteConnected(false))
      .on(RoomEvent.Disconnected, () => setConnected(false))
      .on(RoomEvent.Reconnecting, () => {
        console.warn("[useLiveKitRoom] Reconnecting…");
      })
      .on(RoomEvent.Reconnected, () => {
        console.info("[useLiveKitRoom] Reconnected");
        reattachRemoteTracks(room);
      })
      .on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality, participant) => {
          if (quality === ConnectionQuality.Poor) {
            console.warn(
              "[useLiveKitRoom] Poor connection quality from",
              participant?.identity ?? "local",
            );
          }
        },
      );

    const connectWithRetry = async (attempt: number): Promise<void> => {
      try {
        await room.connect(url, token);
      } catch (err) {
        if (disposed) return;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          return connectWithRetry(attempt + 1);
        }
        throw err;
      }
    };

    void (async () => {
      try {
        await connectWithRetry(0);
        if (disposed) {
          await room.disconnect();
          return;
        }
        setConnected(true);
        setRemoteConnected(room.remoteParticipants.size > 0);

        await room.localParticipant.setMicrophoneEnabled(true);

        if (cameraRef.current) {
          const pub = await room.localParticipant.setCameraEnabled(true);
          if (pub) attachCameraTrack(pub, localVideoRef.current);
        } else {
          await room.localParticipant.setCameraEnabled(false);
          setCameraEnabled(false);
        }
      } catch {
        // Connection failed after retries — `connected` stays false; the
        // hangup button lets the user bail out and server-side cleanup runs.
      }
    })();

    return () => {
      disposed = true;
      void room.disconnect();
      roomRef.current = null;
      setConnected(false);
      setRemoteConnected(false);
    };
  }, [token, reattachRemoteTracks]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable; toggles must not trigger reconnect

  // ---- Wake Lock: prevent OS from sleeping the screen during a call ----
  useEffect(() => {
    if (!connected) return;

    const wakeLockRef: { current: WakeLockSentinel | null } = { current: null };

    const acquire = async () => {
      try {
        if (!("wakeLock" in navigator)) return;
        // Re-entrant: browser may auto-release on visibility change.
        if (wakeLockRef.current) return;
        const sentinel = await navigator.wakeLock.request("screen");
        wakeLockRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          wakeLockRef.current = null;
        });
      } catch {
        // Wake Lock denied (permission policy, headless browser, etc.) —
        // non-fatal, the call still works without it.
      }
    };

    // Re-acquire when the page becomes visible again (tab switch, app
    // foreground). The browser auto-releases the sentinel on visibility
    // change, so we need to grab a fresh one.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [connected]);

  // ---- Media Session: tell the OS this is an active call, not idle tab ----
  useEffect(() => {
    if (!connected || !("mediaSession" in navigator)) return;

    const peer = roomRef.current?.remoteParticipants.values().next().value;
    const title = peer?.name || "Active Call";

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: "Voice Call",
      artwork: [],
    });

    // Indicate the session is "playing" so the OS treats it as active
    // media (no JS throttle, no WebSocket dormancy, foreground priority).
    navigator.mediaSession.playbackState = "playing";

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    };
  }, [connected]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    setMicEnabled(next);
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
    } catch {
      setMicEnabled(!next);
    }
  }, [micEnabled]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraEnabled;
    setCameraEnabled(next);
    try {
      const pub = await room.localParticipant.setCameraEnabled(next);
      if (next && pub) {
        attachCameraTrack(pub, localVideoRef.current);
      } else if (!next && pub?.track) {
        pub.track.detach();
      }
    } catch {
      setCameraEnabled(!next);
    }
  }, [cameraEnabled, localVideoRef]);

  return {
    connected,
    remoteConnected,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
  };
}
