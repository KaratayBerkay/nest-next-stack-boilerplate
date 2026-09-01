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
import {
  hasLiveRemoteCamera,
  hasLiveRemoteScreenShare,
} from "@/lib/rtc/remote-camera";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";
import { useWakeLock } from "@/hooks/rtc/useWakeLock";
import { useMediaSessionActive } from "@/hooks/rtc/useMediaSessionActive";
import { useResumeMediaOnForeground } from "@/hooks/rtc/useResumeMediaOnForeground";

export interface UseLiveKitRoomElements {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  /** Own shared-screen preview — mirrors the meeting room's "Your screen"
   *  tile so a presenter can confirm what's live. */
  localScreenShareRef: React.RefObject<HTMLVideoElement | null>;
  remoteScreenShareRef: React.RefObject<HTMLVideoElement | null>;
}

export interface UseLiveKitRoomResult {
  connected: boolean;
  remoteConnected: boolean;
  /** True only while the peer has a camera track that is publishing and not
   *  muted — the signal for showing their video element instead of the
   *  avatar placeholder. A muted/withdrawn camera track otherwise renders
   *  as a frozen or black rectangle. */
  remoteCameraLive: boolean;
  /** Peer currently publishing an unmuted screen share — same idea as
   *  `remoteCameraLive`, gates the call's main stage switching to their
   *  shared screen (camera moves to a small tile, Meet-style). */
  remoteScreenShareLive: boolean;
  /** False while the peer's microphone is muted — drives the on-tile mute
   *  badge. True whenever no peer is connected (no badge to show). */
  remoteMicEnabled: boolean;
  /** Live active-speaker flags — drive the breathing speak ring/glow, same
   *  treatment the meeting tiles use. */
  remoteSpeaking: boolean;
  localSpeaking: boolean;
  livekitError: "connection" | "microphone" | "camera" | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
}

interface LiveKitMediaState {
  token: string | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
  error: "connection" | "microphone" | "camera" | null;
}

function attachLocalTrack(
  pub: TrackPublication,
  el: HTMLVideoElement | null,
  source: Track.Source,
) {
  if (pub.track && pub.source === source && el) {
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
  const {
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    localScreenShareRef,
    remoteScreenShareRef,
  } = elements;
  const roomRef = useRef<Room | null>(null);
  // Re-entrancy guards for the three toggle callbacks below — a production
  // incident showed a user rapid-clicking the camera button ~10 times in
  // under 4 seconds after a permission hiccup, firing that many overlapping
  // setCameraEnabled() calls (each its own getUserMedia() attempt). Firefox
  // in particular can end up refusing every one of them once a prompt gets
  // dismissed rather than explicitly allowed/denied, which reads as
  // "clicking Allow does nothing." Plain refs (not state) — a toggle click
  // must not cause a render, only gate the next click.
  const micTogglingRef = useRef(false);
  const cameraTogglingRef = useRef(false);
  const screenShareTogglingRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [remoteCameraLive, setRemoteCameraLive] = useState(false);
  const [remoteScreenShareLive, setRemoteScreenShareLive] = useState(false);
  const [remoteMicEnabled, setRemoteMicEnabled] = useState(true);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [mediaState, setMediaState] = useState<LiveKitMediaState>({
    token: null,
    micEnabled: true,
    cameraEnabled: hasVideo,
    screenShareEnabled: false,
    error: null,
  });
  const isCurrentMediaState = mediaState.token === token;
  const micEnabled = isCurrentMediaState ? mediaState.micEnabled : true;
  const cameraEnabled = isCurrentMediaState
    ? mediaState.cameraEnabled
    : hasVideo;
  const screenShareEnabled = isCurrentMediaState
    ? mediaState.screenShareEnabled
    : false;
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
          } else if (pub.kind === Track.Kind.Video) {
            if (pub.source === Track.Source.Camera) {
              attachRemoteTrack(pub.track, remoteVideoRef.current);
            } else if (pub.source === Track.Source.ScreenShare) {
              attachRemoteTrack(pub.track, remoteScreenShareRef.current);
            }
          }
        }
      }
    },
    [remoteAudioRef, remoteVideoRef, remoteScreenShareRef],
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

    const syncRemoteMedia = () => {
      setRemoteCameraLive(hasLiveRemoteCamera(room));
      setRemoteScreenShareLive(hasLiveRemoteScreenShare(room));
      // Peer mic state for the on-tile mute badge. Defaults to true (no
      // badge) while nobody is connected yet.
      const peer = room.remoteParticipants.values().next().value;
      setRemoteMicEnabled(peer ? peer.isMicrophoneEnabled : true);
    };

    room
      .on(RoomEvent.TrackSubscribed, (track, publication) => {
        const el =
          track.kind === Track.Kind.Audio
            ? remoteAudioRef.current
            : publication.source === Track.Source.ScreenShare
              ? remoteScreenShareRef.current
              : remoteVideoRef.current;
        attachRemoteTrack(track, el);
        syncRemoteMedia();
      })
      .on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach();
        syncRemoteMedia();
      })
      // Mute/unmute don't unsubscribe the track — without these the peer
      // turning their camera off left a frozen/black frame on screen
      // instead of the avatar placeholder.
      .on(RoomEvent.TrackMuted, syncRemoteMedia)
      .on(RoomEvent.TrackUnmuted, syncRemoteMedia)
      .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        setLocalSpeaking(speakers.some((s) => s.isLocal));
        setRemoteSpeaking(speakers.some((s) => !s.isLocal));
      })
      .on(RoomEvent.TrackSubscriptionFailed, (trackSid) => {
        telemetry("call.livekit.track_subscription_failed", {
          exceptionType: "CLIENT_ERROR",
          metadata: { trackSid },
          phase: "connected",
        });
      })
      .on(RoomEvent.LocalTrackPublished, (pub) => {
        attachLocalTrack(pub, localVideoRef.current, Track.Source.Camera);
        attachLocalTrack(
          pub,
          localScreenShareRef.current,
          Track.Source.ScreenShare,
        );
      })
      .on(RoomEvent.LocalTrackUnpublished, (pub) => {
        if (
          pub.track &&
          (pub.source === Track.Source.Camera ||
            pub.source === Track.Source.ScreenShare)
        ) {
          pub.track.detach();
        }
      })
      .on(RoomEvent.ParticipantConnected, () => {
        setRemoteConnected(true);
        syncRemoteMedia();
      })
      .on(RoomEvent.ParticipantDisconnected, () => {
        setRemoteConnected(room.remoteParticipants.size > 0);
        syncRemoteMedia();
      })
      .on(RoomEvent.Disconnected, () => {
        if (disposed) return;
        telemetry("call.livekit.disconnected", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
        });
        setConnected(false);
        setRemoteConnected(false);
        setRemoteCameraLive(false);
        setRemoteScreenShareLive(false);
        setRemoteMicEnabled(true);
        setRemoteSpeaking(false);
        setLocalSpeaking(false);
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
        syncRemoteMedia();
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
        syncRemoteMedia();
        setMediaState({
          token,
          micEnabled: true,
          cameraEnabled: hasVideo,
          screenShareEnabled: false,
          error: null,
        });

        if (hasVideo) {
          try {
            // Acquire mic + camera together via LiveKit's own helper — one
            // combined getUserMedia() call so the browser shows a SINGLE
            // permission prompt instead of two back-to-back ones. Firefox
            // in particular queues separate audio-only/video-only prompts
            // oddly close together, which read as "clicking Allow does
            // nothing" when the second prompt (for the other device)
            // appears right as the first is dismissed. The resulting
            // publications attach to localVideoRef via the
            // LocalTrackPublished listener registered above.
            await room.localParticipant.enableCameraAndMicrophone();
            if (disposed) return;
          } catch (error) {
            if (disposed) return;
            telemetry("call.media.camera_microphone_enable_failed", {
              exceptionType: "CLIENT_ERROR",
              error,
              phase: "connected",
            });
            setMediaState((current) =>
              current.token === token
                ? {
                    ...current,
                    micEnabled: false,
                    cameraEnabled: false,
                    error: "camera",
                  }
                : current,
            );
          }
        } else {
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
                  screenShareEnabled: false,
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
      setRemoteCameraLive(false);
      setRemoteScreenShareLive(false);
      setRemoteMicEnabled(true);
      setRemoteSpeaking(false);
      setLocalSpeaking(false);
    };
  }, [callId, roomName, token, hasVideo, reattachRemoteTracks]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable; toggles must not trigger reconnect

  // Prevent OS sleep/throttling while the call is up, and mark the tab as
  // active media for the lock screen.
  useWakeLock(connected);
  // Un-pause both media elements when the tab returns to the foreground —
  // without this, mobile video stays black after backgrounding the browser.
  const resumeRemoteMedia = useCallback(() => {
    const room = roomRef.current;
    if (room) reattachRemoteTracks(room);
  }, [reattachRemoteTracks]);
  useResumeMediaOnForeground(roomRef, connected, resumeRemoteMedia);
  // Memoized on remoteConnected (not just connected): on the caller side,
  // `connected` typically flips true before the callee's participant has
  // joined, so remoteParticipants is empty at that instant — the identity
  // change once the peer connects re-runs the media-session effect so the
  // lock-screen title doesn't stay stuck on the "Active Call" fallback.
  const resolveMediaTitle = useCallback(() => {
    if (!remoteConnected) return "Active Call";
    const peer = roomRef.current?.remoteParticipants.values().next().value;
    return peer?.name || "Active Call";
  }, [remoteConnected]);
  useMediaSessionActive(connected, resolveMediaTitle, "Voice Call");

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !connected || micTogglingRef.current) return;
    micTogglingRef.current = true;
    const next = !micEnabled;
    setMediaState((current) => ({
      ...(current.token === token
        ? current
        : {
            token,
            micEnabled: true,
            cameraEnabled: hasVideo,
            screenShareEnabled: false,
            error: null,
          }),
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
    } finally {
      micTogglingRef.current = false;
    }
  }, [callId, connected, hasVideo, micEnabled, roomName, token]);

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !connected || cameraTogglingRef.current) return;
    cameraTogglingRef.current = true;
    const next = !cameraEnabled;
    setMediaState((current) => ({
      ...(current.token === token
        ? current
        : {
            token,
            micEnabled: true,
            cameraEnabled: hasVideo,
            screenShareEnabled: false,
            error: null,
          }),
      cameraEnabled: next,
    }));
    try {
      const pub = await room.localParticipant.setCameraEnabled(next);
      if (next && pub) {
        attachLocalTrack(pub, localVideoRef.current, Track.Source.Camera);
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
    } finally {
      cameraTogglingRef.current = false;
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

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room || !connected || screenShareTogglingRef.current) return;
    screenShareTogglingRef.current = true;
    const next = !screenShareEnabled;
    setMediaState((current) => ({
      ...(current.token === token
        ? current
        : {
            token,
            micEnabled: true,
            cameraEnabled: hasVideo,
            screenShareEnabled: false,
            error: null,
          }),
      screenShareEnabled: next,
    }));
    try {
      const pub = await room.localParticipant.setScreenShareEnabled(next);
      if (next && pub) {
        attachLocalTrack(
          pub,
          localScreenShareRef.current,
          Track.Source.ScreenShare,
        );
      } else if (!next && pub?.track) {
        pub.track.detach();
      }
    } catch (error) {
      logRtcEvent({
        event: "call.media.screen_share_toggle_failed",
        rtcKind: "call",
        rtcId: callId,
        roomName,
        mediaType: "video",
        phase: "connected",
        exceptionType: "CLIENT_ERROR",
        error,
      });
      // User cancelled the browser's screen-share picker (or it failed) —
      // revert the optimistic toggle rather than showing a stuck-on state.
      setMediaState((current) =>
        current.token === token
          ? { ...current, screenShareEnabled: false }
          : current,
      );
    } finally {
      screenShareTogglingRef.current = false;
    }
  }, [
    callId,
    connected,
    hasVideo,
    localScreenShareRef,
    roomName,
    screenShareEnabled,
    token,
  ]);

  return {
    connected,
    remoteConnected,
    remoteCameraLive,
    remoteScreenShareLive,
    remoteMicEnabled,
    remoteSpeaking,
    localSpeaking,
    livekitError,
    micEnabled,
    cameraEnabled,
    screenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
