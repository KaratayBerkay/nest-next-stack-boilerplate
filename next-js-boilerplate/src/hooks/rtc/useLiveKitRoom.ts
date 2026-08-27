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
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";

export interface UseLiveKitRoomElements {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export interface UseLiveKitRoomResult {
  connected: boolean;
  remoteConnected: boolean;
  livekitError: "connection" | "microphone" | "camera" | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
}

interface LiveKitMediaState {
  token: string | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  error: "connection" | "microphone" | "camera" | null;
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
  callId?: string | null,
  roomName?: string | null,
): UseLiveKitRoomResult {
  const { localVideoRef, remoteVideoRef, remoteAudioRef } = elements;
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [mediaState, setMediaState] = useState<LiveKitMediaState>({
    token: null,
    micEnabled: true,
    cameraEnabled: hasVideo,
    error: null,
  });
  const isCurrentMediaState = mediaState.token === token;
  const micEnabled = isCurrentMediaState ? mediaState.micEnabled : true;
  const cameraEnabled = isCurrentMediaState
    ? mediaState.cameraEnabled
    : hasVideo;
  const livekitError = isCurrentMediaState ? mediaState.error : null;

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

    const telemetry = (
      event: string,
      options: {
        exceptionType?: "CLIENT_ERROR" | "CLIENT_REJECTION";
        error?: unknown;
        metadata?: Record<string, unknown>;
        phase?: string;
      } = {},
    ) => {
      logRtcEvent({
        event,
        rtcKind: "call",
        rtcId: callId,
        roomName,
        mediaType: hasVideo ? "video" : "audio",
        ...options,
      });
    };

    telemetry("call.livekit.connecting", { phase: "connecting" });

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
        telemetry("call.livekit.track_subscription_failed", {
          exceptionType: "CLIENT_ERROR",
          metadata: { trackSid },
          phase: "connected",
        });
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
      .on(RoomEvent.ParticipantDisconnected, () =>
        setRemoteConnected(room.remoteParticipants.size > 0),
      )
      .on(RoomEvent.Disconnected, () => {
        if (disposed) return;
        telemetry("call.livekit.disconnected", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
        });
        setConnected(false);
        setRemoteConnected(false);
        setMediaState((current) =>
          current.token === token
            ? { ...current, error: "connection" }
            : current,
        );
      })
      .on(RoomEvent.Reconnecting, () => {
        telemetry("call.livekit.reconnecting", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
        });
      })
      .on(RoomEvent.Reconnected, () => {
        telemetry("call.livekit.reconnected", { phase: "connected" });
        reattachRemoteTracks(room);
      })
      .on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality, participant) => {
          if (quality === ConnectionQuality.Poor) {
            telemetry("call.livekit.connection_quality_poor", {
              exceptionType: "CLIENT_ERROR",
              metadata: {
                participantId: participant?.identity ?? "local",
              },
              phase: "connected",
            });
          }
        },
      );

    const connectWithRetry = async (attempt: number): Promise<void> => {
      try {
        await room.connect(url, token);
      } catch (err) {
        if (disposed) return;
        if (attempt < 2) {
          telemetry("call.livekit.connect_retry", {
            exceptionType: "CLIENT_ERROR",
            error: err,
            metadata: { attempt: attempt + 1 },
            phase: "connecting",
          });
          await new Promise((r) => setTimeout(r, 2000));
          return connectWithRetry(attempt + 1);
        }
        telemetry("call.livekit.connection_failed", {
          exceptionType: "CLIENT_ERROR",
          error: err,
          phase: "connecting",
        });
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
        telemetry("call.livekit.connected", { phase: "connected" });
        setRemoteConnected(room.remoteParticipants.size > 0);
        setMediaState({
          token,
          micEnabled: true,
          cameraEnabled: hasVideo,
          error: null,
        });

        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          if (disposed) return;
        } catch (error) {
          if (disposed) return;
          telemetry("call.media.microphone_enable_failed", {
            exceptionType: "CLIENT_ERROR",
            error,
            phase: "connected",
          });
          setMediaState((current) =>
            current.token === token
              ? { ...current, micEnabled: false, error: "microphone" }
              : current,
          );
        }

        if (hasVideo) {
          try {
            const pub = await room.localParticipant.setCameraEnabled(true);
            if (disposed) return;
            if (pub) attachCameraTrack(pub, localVideoRef.current);
          } catch (error) {
            if (disposed) return;
            telemetry("call.media.camera_enable_failed", {
              exceptionType: "CLIENT_ERROR",
              error,
              phase: "connected",
            });
            setMediaState((current) =>
              current.token === token
                ? {
                    ...current,
                    cameraEnabled: false,
                    error: current.error ?? "camera",
                  }
                : current,
            );
          }
        }
      } catch (error) {
        if (!disposed) {
          telemetry("call.livekit.connection_failed", {
            exceptionType: "CLIENT_ERROR",
            error,
            phase: "connecting",
          });
          setConnected(false);
          setRemoteConnected(false);
          setMediaState((current) =>
            current.token === token
              ? { ...current, error: "connection" }
              : {
                  token,
                  micEnabled: true,
                  cameraEnabled: hasVideo,
                  error: "connection",
                },
          );
        }
      }
    })();

    return () => {
      disposed = true;
      void room.disconnect();
      roomRef.current = null;
      setConnected(false);
      setRemoteConnected(false);
    };
  }, [callId, roomName, token, hasVideo, reattachRemoteTracks]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable; toggles must not trigger reconnect

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
    // remoteConnected (not just connected) is a deliberate dep: on the
    // caller side, `connected` typically flips true before the callee's
    // participant has joined, so remoteParticipants is empty at that
    // instant — without re-running once the peer actually connects, the
    // lock-screen title stays stuck on the "Active Call" fallback for the
    // rest of the call.
  }, [connected, remoteConnected]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !connected) return;
    const next = !micEnabled;
    setMediaState((current) => ({
      ...(current.token === token
        ? current
        : { token, micEnabled: true, cameraEnabled: hasVideo, error: null }),
      micEnabled: next,
    }));
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
    } catch (error) {
      logRtcEvent({
        event: "call.media.microphone_toggle_failed",
        rtcKind: "call",
        rtcId: callId,
        roomName,
        mediaType: hasVideo ? "video" : "audio",
        phase: "connected",
        exceptionType: "CLIENT_ERROR",
        error,
      });
      setMediaState((current) =>
        current.token === token
          ? { ...current, micEnabled: !next, error: "microphone" }
          : current,
      );
    }
  }, [callId, connected, hasVideo, micEnabled, roomName, token]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !connected) return;
    const next = !cameraEnabled;
    setMediaState((current) => ({
      ...(current.token === token
        ? current
        : { token, micEnabled: true, cameraEnabled: hasVideo, error: null }),
      cameraEnabled: next,
    }));
    try {
      const pub = await room.localParticipant.setCameraEnabled(next);
      if (next && pub) {
        attachCameraTrack(pub, localVideoRef.current);
      } else if (!next && pub?.track) {
        pub.track.detach();
      }
    } catch (error) {
      logRtcEvent({
        event: "call.media.camera_toggle_failed",
        rtcKind: "call",
        rtcId: callId,
        roomName,
        mediaType: "video",
        phase: "connected",
        exceptionType: "CLIENT_ERROR",
        error,
      });
      setMediaState((current) =>
        current.token === token
          ? { ...current, cameraEnabled: !next, error: "camera" }
          : current,
      );
    }
  }, [
    callId,
    cameraEnabled,
    connected,
    hasVideo,
    localVideoRef,
    roomName,
    token,
  ]);

  return {
    connected,
    remoteConnected,
    livekitError,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
  };
}
