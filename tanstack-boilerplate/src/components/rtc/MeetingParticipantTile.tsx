"use client";

import type { CSSProperties } from "react";
import { IconMicrophoneOff, IconScreenShare } from "@tabler/icons-react";
import { useTrackAttach } from "@/hooks/rtc/useTrackAttach";
import {
  participantInitials,
  participantPalette,
} from "@/lib/rtc/participant-color";
import type { MeetingParticipantTileProps } from "@/types/rtc/MeetingParticipantTile-types";

/** The three animated equalizer bars Meet shows next to a speaker's name. */
function SpeakingBars() {
  return (
    <span className="flex h-3 shrink-0 items-center gap-[2px]" aria-hidden>
      <span className="animate-sound-bar h-full w-[3px] origin-center rounded-full bg-current" />
      <span className="animate-sound-bar h-full w-[3px] origin-center rounded-full bg-current [animation-delay:0.25s]" />
      <span className="animate-sound-bar h-full w-[3px] origin-center rounded-full bg-current [animation-delay:0.5s]" />
    </span>
  );
}

export function MeetingParticipantTile({
  participant,
  youLabel,
  onClick,
  clickLabel,
}: MeetingParticipantTileProps) {
  const activeVideoTrack =
    participant.screenShareTrack ?? participant.videoTrack;
  // Enabled-flags as resetKey: a camera mute swaps this tile to the avatar
  // and unmounts the <video>; on unmute the SAME track object comes back, so
  // without the key the attach effect wouldn't re-run and the tile could
  // stay black until a reload (adaptiveStream doesn't reliably resume).
  const videoRef = useTrackAttach(
    activeVideoTrack,
    "video",
    `${participant.cameraEnabled}:${participant.screenShareEnabled}`,
  );
  const audioRef = useTrackAttach(
    participant.isLocal ? null : participant.audioTrack,
    "audio",
    participant.micEnabled,
  );
  const isScreenShare = Boolean(participant.screenShareTrack);
  // A screen share renders regardless of camera state — the old
  // `cameraEnabled`-only check hid an active share behind the avatar
  // whenever the sharer's camera was off.
  const showVideo =
    isScreenShare ||
    (Boolean(participant.videoTrack) && participant.cameraEnabled);
  const speaking = participant.isSpeaking;
  const palette = participantPalette(participant.identity);
  const label = participant.isLocal ? youLabel : participant.name;

  return (
    // h-full instead of a forced aspect-video: the stage sizes every cell
    // (grid rows, spotlight area, filmstrip) — an intrinsic aspect ratio here
    // made multi-row grids taller than their fixed-height container, pushing
    // the bottom row out of view behind the control bar.
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? clickLabel : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`bg-surface [container-type:size] relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-xl ${
        speaking && showVideo ? "animate-speaking-glow" : ""
      } ${onClick ? "focus-visible:ring-brand cursor-pointer focus-visible:ring-2 focus-visible:outline-none" : ""}`}
      style={
        {
          "--speak-ring": palette.ring,
          "--speak-halo": palette.halo,
        } as CSSProperties
      }
    >
      {showVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- live meeting video, no caption track exists
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={
            isScreenShare
              ? "bg-overlay h-full w-full object-contain"
              : "h-full w-full object-cover"
          }
        />
      ) : (
        <>
          {/* Identity-colored wash so every camera-off tile is visually
              distinct instead of a uniform black rectangle. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(60% 85% at 50% 45%, ${palette.tintStrong}, ${palette.tintSoft} 100%)`,
            }}
          />
          <div className="relative flex items-center justify-center">
            {speaking && (
              <>
                {/* Two staggered ripples = the continuous breathing ring
                    around the avatar while this participant speaks. */}
                <span
                  aria-hidden
                  className="animate-speaking-ripple absolute -inset-1 rounded-full border-2"
                  style={{ borderColor: palette.ring }}
                />
                <span
                  aria-hidden
                  className="animate-speaking-ripple absolute -inset-1 rounded-full border-2 [animation-delay:0.8s]"
                  style={{ borderColor: palette.ring }}
                />
              </>
            )}
            <span
              aria-hidden
              className="flex aspect-square h-[clamp(3rem,34cqmin,7rem)] items-center justify-center rounded-full text-[length:clamp(1.125rem,13cqmin,2.25rem)] font-semibold shadow-lg"
              style={{
                background: palette.fill,
                color: palette.onFill,
                boxShadow: speaking ? `0 0 0 2px ${palette.ring}` : undefined,
              }}
            >
              {participantInitials(participant.name)}
            </span>
          </div>
        </>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live meeting audio, no caption track exists */}
      <audio ref={audioRef} autoPlay />

      <div className="bg-overlay/60 text-overlay-fg absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur-sm">
        {speaking && <SpeakingBars />}
        <span className="truncate">{label}</span>
        {isScreenShare && <IconScreenShare size={13} aria-hidden />}
      </div>

      {!participant.micEnabled && (
        <span className="bg-overlay/60 text-error absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm">
          <IconMicrophoneOff size={14} aria-hidden />
        </span>
      )}
    </div>
  );
}
