"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type Participant } from "livekit-client";
import { clientEnv } from "@/lib/env";

export interface MeetingParticipantView {
  identity: string;
  name: string;
  isLocal: boolean;
  videoTrack: Track | null;
  screenShareTrack: Track | null;
  audioTrack: Track | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
  isSpeaking: boolean;
}

export interface UseLiveKitMeetingRoomResult {
  connected: boolean;
  participants: MeetingParticipantView[];
  localMicEnabled: boolean;
  localCameraEnabled: boolean;
  localScreenShareEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
}

function toView(
  p: Participant,
  activeSpeakerIds: ReadonlySet<string>,
): MeetingParticipantView {
  const videoPub = [...p.videoTrackPublications.values()].find(
    (pub) => pub.source === Track.Source.Camera,
  );
  const screenPub = [...p.videoTrackPublications.values()].find(
    (pub) => pub.source === Track.Source.ScreenShare,
  );
  const audioPub = [...p.audioTrackPublications.values()].find(
    (pub) => pub.source === Track.Source.Microphone,
  );
  return {
    identity: p.identity,
    name: p.name || p.identity,
    isLocal: p.isLocal,
    videoTrack: videoPub?.track ?? null,
    screenShareTrack: screenPub?.track ?? null,
    audioTrack: audioPub?.track ?? null,
    micEnabled: p.isMicrophoneEnabled,
    cameraEnabled: p.isCameraEnabled,
    screenShareEnabled: p.isScreenShareEnabled,
    isSpeaking: activeSpeakerIds.has(p.identity),
  };
}

/**
 * N-participant analog of useLiveKitRoom (1:1 calls) — the shape differs
 * enough (a dynamic participant list vs. two fixed video elements) to
 * warrant its own hook rather than generalizing that one. Never returns a
 * DOM ref: each participant tile owns its own local useRef/useEffect
 * attach()/detach() pair (see MeetingParticipantTile), the same lesson
 * Phase 2 learned about react-compiler flagging any hook return that mixes
 * refs with plain reactive state — this hook only ever returns Track
 * *objects* (SDK data, not React refs) plus plain state and functions.
 */
export function useLiveKitMeetingRoom(
  token: string | null,
): UseLiveKitMeetingRoomResult {
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<MeetingParticipantView[]>(
    [],
  );
  const [localMicEnabled, setLocalMicEnabled] = useState(true);
  const [localCameraEnabled, setLocalCameraEnabled] = useState(true);
  const [localScreenShareEnabled, setLocalScreenShareEnabled] = useState(false);
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const rebuildParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      setParticipants([]);
      return;
    }
    setParticipants([
      toView(room.localParticipant, activeSpeakerIds),
      ...Array.from(room.remoteParticipants.values(), (p) =>
        toView(p, activeSpeakerIds),
      ),
    ]);
  }, [activeSpeakerIds]);

  useEffect(() => {
    const url = clientEnv.NEXT_PUBLIC_LIVEKIT_URL;
    if (!token || !url) return;

    const room = new Room();
    roomRef.current = room;
    let disposed = false;
    const onAnyChange = () => rebuildParticipants();

    room
      .on(RoomEvent.ParticipantConnected, onAnyChange)
      .on(RoomEvent.ParticipantDisconnected, onAnyChange)
      .on(RoomEvent.TrackSubscribed, onAnyChange)
      .on(RoomEvent.TrackUnsubscribed, onAnyChange)
      .on(RoomEvent.TrackMuted, onAnyChange)
      .on(RoomEvent.TrackUnmuted, onAnyChange)
      .on(RoomEvent.LocalTrackPublished, onAnyChange)
      .on(RoomEvent.LocalTrackUnpublished, onAnyChange)
      .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        setActiveSpeakerIds(new Set(speakers.map((s) => s.identity)));
      })
      .on(RoomEvent.Disconnected, () => setConnected(false));

    void (async () => {
      try {
        await room.connect(url, token);
        if (disposed) {
          await room.disconnect();
          return;
        }
        setConnected(true);
        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(true);
        rebuildParticipants();
      } catch {
        // Connection failed — `connected` stays false; the room UI's own
        // leave control lets the user bail out.
      }
    })();

    return () => {
      disposed = true;
      void room.disconnect();
      roomRef.current = null;
      setParticipants([]);
    };
  }, [token, rebuildParticipants]);

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !localMicEnabled;
    setLocalMicEnabled(next);
    void room.localParticipant
      .setMicrophoneEnabled(next)
      .then(() => rebuildParticipants());
  }, [localMicEnabled, rebuildParticipants]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !localCameraEnabled;
    setLocalCameraEnabled(next);
    void room.localParticipant
      .setCameraEnabled(next)
      .then(() => rebuildParticipants());
  }, [localCameraEnabled, rebuildParticipants]);

  const toggleScreenShare = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !localScreenShareEnabled;
    setLocalScreenShareEnabled(next);
    void room.localParticipant
      .setScreenShareEnabled(next)
      .then(() => rebuildParticipants())
      .catch(() => {
        // User cancelled the browser's screen-share picker (or it failed) —
        // revert the optimistic toggle rather than showing a stuck-on state.
        setLocalScreenShareEnabled(false);
      });
  }, [localScreenShareEnabled, rebuildParticipants]);

  return {
    connected,
    participants,
    localMicEnabled,
    localCameraEnabled,
    localScreenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
