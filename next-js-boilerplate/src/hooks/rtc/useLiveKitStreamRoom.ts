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

    room
      .on(RoomEvent.ParticipantConnected, onAnyChange)
      .on(RoomEvent.ParticipantDisconnected, onAnyChange)
      .on(RoomEvent.TrackSubscribed, onAnyChange)
      .on(RoomEvent.TrackUnsubscribed, onAnyChange)
      .on(RoomEvent.TrackMuted, onAnyChange)
      .on(RoomEvent.TrackUnmuted, onAnyChange)
      .on(RoomEvent.LocalTrackPublished, onAnyChange)
      .on(RoomEvent.LocalTrackUnpublished, onAnyChange)
      .on(RoomEvent.Disconnected, () => setConnected(false))
      .on(RoomEvent.Reconnecting, () => {
        console.warn("[useLiveKitStreamRoom] Reconnecting…");
      })
      .on(RoomEvent.Reconnected, () => {
        console.info("[useLiveKitStreamRoom] Reconnected");
        rebuildBroadcasterTracks();
      })
      .on(RoomEvent.TrackSubscriptionFailed, (trackSid) => {
        console.warn(
          "[useLiveKitStreamRoom] Track subscription failed for",
          trackSid,
        );
      })
      .on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality, participant) => {
          if (quality === ConnectionQuality.Poor) {
            console.warn(
              "[useLiveKitStreamRoom] Poor connection quality from",
              participant?.identity ?? "local",
            );
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
        if (isLocalBroadcaster) {
          await room.localParticipant.setMicrophoneEnabled(true);
          await room.localParticipant.setCameraEnabled(true);
        }
        rebuildBroadcasterTracks();
      } catch {
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
  }, [token, isLocalBroadcaster, rebuildBroadcasterTracks]);

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isLocalBroadcaster) return;
    const next = !localMicEnabled;
    setLocalMicEnabled(next);
    void room.localParticipant
      .setMicrophoneEnabled(next)
      .then(() => rebuildBroadcasterTracks());
  }, [localMicEnabled, isLocalBroadcaster, rebuildBroadcasterTracks]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isLocalBroadcaster) return;
    const next = !localCameraEnabled;
    setLocalCameraEnabled(next);
    void room.localParticipant
      .setCameraEnabled(next)
      .then(() => rebuildBroadcasterTracks());
  }, [localCameraEnabled, isLocalBroadcaster, rebuildBroadcasterTracks]);

  const toggleScreenShare = useCallback(() => {
    const room = roomRef.current;
    if (!room || !isLocalBroadcaster) return;
    const next = !localScreenShareEnabled;
    setLocalScreenShareEnabled(next);
    void room.localParticipant
      .setScreenShareEnabled(next)
      .then(() => rebuildBroadcasterTracks())
      .catch(() => {
        setLocalScreenShareEnabled(false);
      });
  }, [localScreenShareEnabled, isLocalBroadcaster, rebuildBroadcasterTracks]);

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
