"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from "livekit-client";
import { clientEnv } from "@/lib/env";

export interface UseLiveKitRoomElements {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  remoteAudioRef: RefObject<HTMLAudioElement | null>;
}

export interface UseLiveKitRoomResult {
  connected: boolean;
  remoteConnected: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
}

/**
 * Thin wrapper around livekit-client's low-level Room/Track API — no
 * @livekit/components-react, matching this repo's own custom-component
 * culture for mute/camera-toggle/participant-tile UI. `token` is minted
 * server-side (RtcCallProvider's rtc:accepted/active-call snapshot); this
 * hook owns nothing about call signaling, only the media connection once a
 * token exists.
 *
 * Video/audio element refs are created by the caller and passed in, not
 * returned from here — a hook return value that mixes refs with plain
 * reactive state trips react-compiler's ref-during-render check on every
 * property access off the returned object, not just the ref ones.
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

  useEffect(() => {
    const url = clientEnv.NEXT_PUBLIC_LIVEKIT_URL;
    if (!token || !url) return;

    const room = new Room();
    roomRef.current = room;
    let disposed = false;

    const attachRemote = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
        track.attach(remoteVideoRef.current);
      } else if (track.kind === Track.Kind.Audio && remoteAudioRef.current) {
        track.attach(remoteAudioRef.current);
      }
    };

    room
      .on(
        RoomEvent.TrackSubscribed,
        (
          track: RemoteTrack,
          _pub: RemoteTrackPublication,
          _participant: RemoteParticipant,
        ) => attachRemote(track),
      )
      .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => track.detach())
      .on(RoomEvent.ParticipantConnected, () => setRemoteConnected(true))
      .on(RoomEvent.ParticipantDisconnected, () => setRemoteConnected(false))
      .on(RoomEvent.Disconnected, () => setConnected(false));

    void (async () => {
      try {
        await room.connect(url, token);
        if (disposed) {
          await room.disconnect();
          return;
        }
        setConnected(true);
        setRemoteConnected(room.remoteParticipants.size > 0);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (hasVideo) {
          const pub = await room.localParticipant.setCameraEnabled(true);
          if (pub?.track && localVideoRef.current) {
            pub.track.attach(localVideoRef.current);
          }
        } else {
          setCameraEnabled(false);
        }
      } catch {
        // Connection failed — `connected` stays false; the call UI's own
        // hangup control lets the user bail out, and the server-side
        // duration cap / LiveKit webhook cleanup aren't affected either way.
      }
    })();

    return () => {
      disposed = true;
      void room.disconnect();
      roomRef.current = null;
    };
  }, [token, hasVideo, localVideoRef, remoteVideoRef, remoteAudioRef]);

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    setMicEnabled(next);
    void room.localParticipant.setMicrophoneEnabled(next);
  }, [micEnabled]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraEnabled;
    setCameraEnabled(next);
    void room.localParticipant.setCameraEnabled(next).then((pub) => {
      if (next && pub?.track && localVideoRef.current) {
        pub.track.attach(localVideoRef.current);
      }
    });
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
