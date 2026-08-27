"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  ConnectionQuality,
  type Participant,
} from "livekit-client";
import { clientEnv } from "@/lib/env";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";
import { useWakeLock } from "@/hooks/rtc/useWakeLock";
import { useMediaSessionActive } from "@/hooks/rtc/useMediaSessionActive";

export interface UseLiveKitStreamRoomResult {
  connected: boolean;
  broadcasterOnline: boolean;
  videoTrack: Track | null;
  screenShareTrack: Track | null;
  audioTrack: Track | null;
  localMicEnabled: boolean;
  localCameraEnabled: boolean;
  localScreenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
}

/**
 * Single-broadcaster analog of useLiveKitMeetingRoom (Phase 3) — a stream
 * has exactly one video that matters, never a per-viewer grid (every viewer
 * that joins the LiveKit room is a RemoteParticipant too, but they're never
 * rendered). `isLocalBroadcaster` picks whether "the broadcaster" is the
 * local participant (go-live page, publish-capable token) or a remote one
 * (viewer page, subscribe-only token) — the same hook drives both pages.
 * Only ever returns Track *objects* (SDK data, not React refs) plus plain
 * state/functions — same react-compiler-safe shape as the meeting hook.
 */
export function useLiveKitStreamRoom(
  token: string | null,
  broadcasterId: string,
  isLocalBroadcaster: boolean,
  streamId?: string | null,
  roomName?: string | null,
): UseLiveKitStreamRoomResult {
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [broadcasterOnline, setBroadcasterOnline] = useState(false);
  const [videoTrack, setVideoTrack] = useState<Track | null>(null);
  const [screenShareTrack, setScreenShareTrack] = useState<Track | null>(null);
  const [audioTrack, setAudioTrack] = useState<Track | null>(null);
  const [localMicEnabled, setLocalMicEnabled] = useState(true);
  const [localCameraEnabled, setLocalCameraEnabled] = useState(true);
  const [localScreenShareEnabled, setLocalScreenShareEnabled] = useState(false);

  const rebuildBroadcasterTracks = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      setBroadcasterOnline(false);
      setVideoTrack(null);
      setScreenShareTrack(null);
      setAudioTrack(null);
      return;
    }
    const broadcaster: Participant | undefined = isLocalBroadcaster
      ? room.localParticipant
      : room.remoteParticipants.get(broadcasterId);
    if (!broadcaster) {
      setBroadcasterOnline(false);
      setVideoTrack(null);
      setScreenShareTrack(null);
      setAudioTrack(null);
      return;
    }
    setBroadcasterOnline(true);
    const videoPub = [...broadcaster.videoTrackPublications.values()].find(
      (pub) => pub.source === Track.Source.Camera,
    );
    const screenPub = [...broadcaster.videoTrackPublications.values()].find(
      (pub) => pub.source === Track.Source.ScreenShare,
    );
    const audioPub = [...broadcaster.audioTrackPublications.values()].find(
      (pub) => pub.source === Track.Source.Microphone,
    );
    setVideoTrack(videoPub?.track ?? null);
    setScreenShareTrack(screenPub?.track ?? null);
    setAudioTrack(audioPub?.track ?? null);
  }, [broadcasterId, isLocalBroadcaster]);

  useEffect(() => {
    const url = clientEnv.NEXT_PUBLIC_LIVEKIT_URL;
    if (!token || !url) return;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    let disposed = false;
    const onAnyChange = () => rebuildBroadcasterTracks();
    const telemetry = (
      event: string,
      options: {
        exceptionType?: "CLIENT_ERROR" | "CLIENT_REJECTION";
        error?: unknown;
        metadata?: Record<string, unknown>;
        phase?: string;
        mediaType?: "audio" | "video" | "screen";
      } = {},
    ) => {
      logRtcEvent({
        event,
        rtcKind: "stream",
        rtcId: streamId,
        roomName,
        ...options,
        metadata: {
          role: isLocalBroadcaster ? "broadcaster" : "viewer",
          ...options.metadata,
        },
      });
    };

    telemetry("stream.livekit.connecting", { phase: "connecting" });

    room
      .on(RoomEvent.ParticipantConnected, onAnyChange)
      .on(RoomEvent.ParticipantDisconnected, onAnyChange)
      .on(RoomEvent.TrackSubscribed, onAnyChange)
      .on(RoomEvent.TrackUnsubscribed, onAnyChange)
      .on(RoomEvent.TrackMuted, onAnyChange)
      .on(RoomEvent.TrackUnmuted, onAnyChange)
      .on(RoomEvent.LocalTrackPublished, onAnyChange)
      .on(RoomEvent.LocalTrackUnpublished, onAnyChange)
      .on(RoomEvent.Disconnected, () => {
        if (disposed) return;
        telemetry("stream.livekit.disconnected", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
        });
        setConnected(false);
      })
      .on(RoomEvent.Reconnecting, () => {
        telemetry("stream.livekit.reconnecting", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
        });
      })
      .on(RoomEvent.Reconnected, () => {
        telemetry("stream.livekit.reconnected", { phase: "connected" });
        rebuildBroadcasterTracks();
      })
      .on(RoomEvent.TrackSubscriptionFailed, (trackSid) => {
        telemetry("stream.livekit.track_subscription_failed", {
          exceptionType: "CLIENT_ERROR",
          metadata: { trackSid },
          phase: "connected",
        });
      })
      .on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality, participant) => {
          if (quality === ConnectionQuality.Poor) {
            telemetry("stream.livekit.connection_quality_poor", {
              exceptionType: "CLIENT_ERROR",
              metadata: {
                participantId: participant?.identity ?? "local",
              },
              phase: "connected",
            });
          }
        },
      );

    void (async () => {
      try {
        await room.connect(url, token);
        if (disposed) {
          await room.disconnect();
          return;
        }
        setConnected(true);
        telemetry("stream.livekit.connected", { phase: "connected" });
        if (isLocalBroadcaster) {
          try {
            await room.localParticipant.setMicrophoneEnabled(true);
          } catch (error) {
            telemetry("stream.media.microphone_enable_failed", {
              exceptionType: "CLIENT_ERROR",
              error,
              mediaType: "audio",
              phase: "connected",
            });
            // Keep the control bar honest: the optimistic `true` initial
            // state would otherwise show an unmuted mic that never actually
            // enabled (permission denied / no device).
            setLocalMicEnabled(false);
          }
          try {
            await room.localParticipant.setCameraEnabled(true);
          } catch (error) {
            telemetry("stream.media.camera_enable_failed", {
              exceptionType: "CLIENT_ERROR",
              error,
              mediaType: "video",
              phase: "connected",
            });
            setLocalCameraEnabled(false);
          }
        }
        rebuildBroadcasterTracks();
      } catch (error) {
        telemetry("stream.livekit.connection_failed", {
          exceptionType: "CLIENT_ERROR",
          error,
          phase: "connecting",
        });
        // Connection failed — `connected` stays false; the page's own
        // leave/back control lets the user bail out.
      }
    })();

    return () => {
      disposed = true;
      void room.disconnect();
      roomRef.current = null;
      setBroadcasterOnline(false);
      setVideoTrack(null);
      setScreenShareTrack(null);
      setAudioTrack(null);
    };
  }, [isLocalBroadcaster, rebuildBroadcasterTracks, roomName, streamId, token]);

  // Prevent OS sleep/throttling while the stream is up (broadcasting or
  // viewing), and mark the tab as active media for the lock screen.
  useWakeLock(connected);
  useMediaSessionActive(connected, roomName || "Live Stream", "Live Stream");

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isLocalBroadcaster) return;
    const next = !localMicEnabled;
    setLocalMicEnabled(next);
    void room.localParticipant
      .setMicrophoneEnabled(next)
      .then(() => rebuildBroadcasterTracks())
      .catch((error) => {
        logRtcEvent({
          event: "stream.media.microphone_toggle_failed",
          rtcKind: "stream",
          rtcId: streamId,
          roomName,
          mediaType: "audio",
          phase: "connected",
          exceptionType: "CLIENT_ERROR",
          error,
        });
        // Revert the optimistic flip — without this the mute icon could
        // show "unmuted" while the mic call actually failed and stayed
        // muted (or vice versa), with no way to tell from the UI.
        setLocalMicEnabled(!next);
      });
  }, [
    localMicEnabled,
    isLocalBroadcaster,
    rebuildBroadcasterTracks,
    roomName,
    streamId,
  ]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isLocalBroadcaster) return;
    const next = !localCameraEnabled;
    setLocalCameraEnabled(next);
    void room.localParticipant
      .setCameraEnabled(next)
      .then(() => rebuildBroadcasterTracks())
      .catch((error) => {
        logRtcEvent({
          event: "stream.media.camera_toggle_failed",
          rtcKind: "stream",
          rtcId: streamId,
          roomName,
          mediaType: "video",
          phase: "connected",
          exceptionType: "CLIENT_ERROR",
          error,
        });
        setLocalCameraEnabled(!next);
      });
  }, [
    localCameraEnabled,
    isLocalBroadcaster,
    rebuildBroadcasterTracks,
    roomName,
    streamId,
  ]);

  const toggleScreenShare = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isLocalBroadcaster) return;
    const next = !localScreenShareEnabled;
    setLocalScreenShareEnabled(next);
    void room.localParticipant
      .setScreenShareEnabled(next)
      .then(() => rebuildBroadcasterTracks())
      .catch((error) => {
        logRtcEvent({
          event: "stream.media.screen_share_failed",
          rtcKind: "stream",
          rtcId: streamId,
          roomName,
          mediaType: "screen",
          phase: "connected",
          exceptionType: "CLIENT_ERROR",
          error,
        });
        setLocalScreenShareEnabled(false);
      });
  }, [
    localScreenShareEnabled,
    isLocalBroadcaster,
    rebuildBroadcasterTracks,
    roomName,
    streamId,
  ]);

  return {
    connected,
    broadcasterOnline,
    videoTrack,
    screenShareTrack,
    audioTrack,
    localMicEnabled,
    localCameraEnabled,
    localScreenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
