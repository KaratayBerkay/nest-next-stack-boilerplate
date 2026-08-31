"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  ConnectionQuality,
  DisconnectReason,
  type Participant,
} from "livekit-client";
import { clientEnv } from "@/lib/env";
import { logRtcEvent } from "@/lib/rtc/rtc-telemetry";
import { useWakeLock } from "@/hooks/rtc/useWakeLock";
import { useMediaSessionActive } from "@/hooks/rtc/useMediaSessionActive";
import { useResumeMediaOnForeground } from "@/hooks/rtc/useResumeMediaOnForeground";

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
  /** The server kicked THIS connection because the same user joined the
   *  room again elsewhere (second tab/window/device). LiveKit allows one
   *  live connection per identity per room — the newest join wins. */
  duplicateKicked: boolean;
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
  meetingId?: string | null,
  roomName?: string | null,
): UseLiveKitMeetingRoomResult {
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [duplicateKicked, setDuplicateKicked] = useState(false);
  const [participants, setParticipants] = useState<MeetingParticipantView[]>(
    [],
  );
  const [localMicEnabled, setLocalMicEnabled] = useState(true);
  const [localCameraEnabled, setLocalCameraEnabled] = useState(true);
  const [localScreenShareEnabled, setLocalScreenShareEnabled] = useState(false);
  // A ref, not useState: this only needs to be *current* at the moment
  // rebuildParticipants reads it — it never needs to be reactive on its own.
  // LiveKit fires ActiveSpeakersChanged continuously during any conversation;
  // making it useState (and a dep of rebuildParticipants, which sits in the
  // room-connect effect's deps below) meant every speaking-activity update
  // tore down and reconnected the entire LiveKit room.
  const activeSpeakerIdsRef = useRef<ReadonlySet<string>>(new Set());

  const rebuildParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) {
      setParticipants([]);
      return;
    }
    const activeSpeakerIds = activeSpeakerIdsRef.current;
    setParticipants([
      toView(room.localParticipant, activeSpeakerIds),
      ...Array.from(room.remoteParticipants.values(), (p) =>
        toView(p, activeSpeakerIds),
      ),
    ]);
  }, []);

  useEffect(() => {
    const url = clientEnv.NEXT_PUBLIC_LIVEKIT_URL;
    if (!token || !url) return;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    let disposed = false;
    const onAnyChange = () => rebuildParticipants();
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
        rtcKind: "meeting",
        rtcId: meetingId,
        roomName,
        ...options,
      });
    };

    telemetry("meeting.livekit.connecting", { phase: "connecting" });

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
        activeSpeakerIdsRef.current = new Set(speakers.map((s) => s.identity));
        rebuildParticipants();
      })
      .on(RoomEvent.Disconnected, (reason) => {
        if (disposed) return;
        telemetry("meeting.livekit.disconnected", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
          metadata: { reason: reason ?? null },
        });
        if (reason === DisconnectReason.DUPLICATE_IDENTITY) {
          setDuplicateKicked(true);
        }
        setConnected(false);
      })
      .on(RoomEvent.Reconnecting, () => {
        telemetry("meeting.livekit.reconnecting", {
          exceptionType: "CLIENT_ERROR",
          phase: "connected",
        });
      })
      .on(RoomEvent.Reconnected, () => {
        telemetry("meeting.livekit.reconnected", { phase: "connected" });
        rebuildParticipants();
      })
      .on(RoomEvent.TrackSubscriptionFailed, (trackSid) => {
        telemetry("meeting.livekit.track_subscription_failed", {
          exceptionType: "CLIENT_ERROR",
          metadata: { trackSid },
          phase: "connected",
        });
      })
      .on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality, participant) => {
          if (quality === ConnectionQuality.Poor) {
            telemetry("meeting.livekit.connection_quality_poor", {
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
        setDuplicateKicked(false);
        telemetry("meeting.livekit.connected", { phase: "connected" });
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
        } catch (error) {
          telemetry("meeting.media.microphone_enable_failed", {
            exceptionType: "CLIENT_ERROR",
            error,
            mediaType: "audio",
            phase: "connected",
          });
          // Keep the control bar honest: the optimistic `true` initial state
          // would otherwise show an unmuted mic that never actually enabled
          // (permission denied / no device).
          setLocalMicEnabled(false);
        }
        try {
          await room.localParticipant.setCameraEnabled(true);
        } catch (error) {
          telemetry("meeting.media.camera_enable_failed", {
            exceptionType: "CLIENT_ERROR",
            error,
            mediaType: "video",
            phase: "connected",
          });
          setLocalCameraEnabled(false);
        }
        rebuildParticipants();
      } catch (error) {
        telemetry("meeting.livekit.connection_failed", {
          exceptionType: "CLIENT_ERROR",
          error,
          phase: "connecting",
        });
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
  }, [meetingId, roomName, token, rebuildParticipants]);

  // Prevent OS sleep/throttling while the meeting is up, and mark the tab
  // as active media for the lock screen.
  useWakeLock(connected);
  useMediaSessionActive(connected, roomName || "Meeting", "Group Meeting");
  // Un-pause every media element when the tab returns to the foreground —
  // without this, mobile tiles stay black after backgrounding the browser.
  useResumeMediaOnForeground(roomRef, connected, rebuildParticipants);

  const toggleMic = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !localMicEnabled;
    setLocalMicEnabled(next);
    void room.localParticipant
      .setMicrophoneEnabled(next)
      .then(() => rebuildParticipants())
      .catch((error) => {
        logRtcEvent({
          event: "meeting.media.microphone_toggle_failed",
          rtcKind: "meeting",
          rtcId: meetingId,
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
  }, [localMicEnabled, meetingId, rebuildParticipants, roomName]);

  const toggleCamera = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !localCameraEnabled;
    setLocalCameraEnabled(next);
    void room.localParticipant
      .setCameraEnabled(next)
      .then(() => rebuildParticipants())
      .catch((error) => {
        logRtcEvent({
          event: "meeting.media.camera_toggle_failed",
          rtcKind: "meeting",
          rtcId: meetingId,
          roomName,
          mediaType: "video",
          phase: "connected",
          exceptionType: "CLIENT_ERROR",
          error,
        });
        setLocalCameraEnabled(!next);
      });
  }, [localCameraEnabled, meetingId, rebuildParticipants, roomName]);

  const toggleScreenShare = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const next = !localScreenShareEnabled;
    setLocalScreenShareEnabled(next);
    void room.localParticipant
      .setScreenShareEnabled(next)
      .then(() => rebuildParticipants())
      .catch((error) => {
        logRtcEvent({
          event: "meeting.media.screen_share_failed",
          rtcKind: "meeting",
          rtcId: meetingId,
          roomName,
          mediaType: "screen",
          phase: "connected",
          exceptionType: "CLIENT_ERROR",
          error,
        });
        // User cancelled the browser's screen-share picker (or it failed) —
        // revert the optimistic toggle rather than showing a stuck-on state.
        setLocalScreenShareEnabled(false);
      });
  }, [localScreenShareEnabled, meetingId, rebuildParticipants, roomName]);

  return {
    connected,
    duplicateKicked,
    participants,
    localMicEnabled,
    localCameraEnabled,
    localScreenShareEnabled,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
