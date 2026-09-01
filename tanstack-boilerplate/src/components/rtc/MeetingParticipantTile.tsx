"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import {
  IconMicrophoneOff,
  IconScreenShare,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
import { useScrollZoom } from "@/hooks/rtc/useScrollZoom";
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
  videoMode = "camera",
  onClick,
  clickLabel,
  label: labelOverride,
  zoomable = false,
  zoomInLabel,
  zoomOutLabel,
  resetZoomLabel,
}: MeetingParticipantTileProps) {
  const isScreenShare = videoMode === "screen";
  // Camera tiles only ever show the camera track — a presenter's own face
  // used to disappear behind their shared screen because this tile fell
  // back to screenShareTrack whenever one was live. Screen-share tiles are
  // now a separate tile the stage renders alongside the camera tile, so
  // both show up at once (Meet-style) instead of one hiding the other.
  const activeVideoTrack = isScreenShare
    ? participant.screenShareTrack
    : participant.videoTrack;
  // Enabled-flags as resetKey: a camera mute swaps this tile to the avatar
  // and unmounts the <video>; on unmute the SAME track object comes back, so
  // without the key the attach effect wouldn't re-run and the tile could
  // stay black until a reload (adaptiveStream doesn't reliably resume).
  const videoRef = useTrackAttach(
    activeVideoTrack,
    "video",
    isScreenShare ? participant.screenShareEnabled : participant.cameraEnabled,
  );
  // Screen-share tiles never carry audio: a participant now has two tiles
  // (camera + screen), and attaching the same mic track to both would play
  // their voice twice.
  const audioRef = useTrackAttach(
    participant.isLocal || isScreenShare ? null : participant.audioTrack,
    "audio",
    participant.micEnabled,
  );
  // A screen share renders regardless of camera state — the old
  // `cameraEnabled`-only check hid an active share behind the avatar
  // whenever the sharer's camera was off.
  const showVideo = isScreenShare
    ? Boolean(participant.screenShareTrack)
    : Boolean(participant.videoTrack) && participant.cameraEnabled;
  // Called unconditionally (rules of hooks) even for camera tiles / a
  // non-zoomable screen tile — its state just never renders in that case.
  // Keyed on the track so a fresh share session starts at 1x rather than
  // carrying over whatever zoom the last one was left at.
  const zoomScrollRef = useRef<HTMLDivElement>(null);
  const zoomCtl = useScrollZoom(zoomScrollRef, activeVideoTrack);
  const showZoomControls = zoomable && isScreenShare && showVideo;
  const speaking = !isScreenShare && participant.isSpeaking;
  const palette = participantPalette(participant.identity);
  const label =
    labelOverride ?? (participant.isLocal ? youLabel : participant.name);

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
        showZoomControls ? (
          // Scroll container, not a transform: `overflow-auto` + a
          // percentage-sized video makes the box genuinely scrollable
          // (native wheel/trackpad/scrollbar panning), which a CSS
          // `transform: scale()` alone would not give — that only changes
          // paint, not layout, so nothing would be left to scroll.
          // Passive wrapper, not itself an interactive control: the real
          // interaction is the drag gesture (pointer events, handled via
          // zoomCtl.panHandlers below — click-drag-to-pan has no natural
          // keyboard equivalent), and onClick here only stops a pan drag's
          // trailing click from also toggling the tile's focus. Same
          // "passive wrapper" reasoning as tooltip-trigger.tsx.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            ref={zoomScrollRef}
            className={`absolute inset-0 overflow-auto ${
              zoomCtl.isPannable
                ? zoomCtl.isPanning
                  ? "cursor-grabbing touch-none select-none"
                  : "cursor-grab touch-none select-none"
                : ""
            }`}
            onClick={(e) => zoomCtl.isPannable && e.stopPropagation()}
            {...zoomCtl.panHandlers}
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live meeting video, no caption track exists */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={participant.isLocal}
              className="bg-overlay pointer-events-none object-contain"
              style={{
                width: `${zoomCtl.zoom * 100}%`,
                height: `${zoomCtl.zoom * 100}%`,
              }}
            />
          </div>
        ) : (
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
        )
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

      {!isScreenShare && !participant.micEnabled && (
        <span className="bg-overlay/60 text-error absolute top-2 right-2 flex size-7 items-center justify-center rounded-full backdrop-blur-sm">
          <IconMicrophoneOff size={14} aria-hidden />
        </span>
      )}

      {showZoomControls && (
        <div className="bg-overlay/60 text-overlay-fg absolute top-2 right-2 flex items-center gap-0.5 rounded-full p-0.5 backdrop-blur-sm">
          {/* All three buttons stay mounted (Reset only disabled, not
              conditionally unmounted) so this row's layout never shifts —
              it used to insert Reset between Zoom out/in the moment you
              zoomed once, which shoved Zoom in one slot to the right and
              turned your next click at the same spot into a Reset click,
              instantly snapping back to 1x. */}
          <IconButton
            size="icon-xs"
            variant="ghost"
            icon={<IconZoomOut size={14} />}
            label={zoomOutLabel ?? ""}
            disabled={!zoomCtl.canZoomOut}
            // stopPropagation: this sits inside the tile's own onClick
            // (focus/unfocus toggle) — zooming shouldn't also flip the
            // spotlight.
            onClick={(e) => {
              e.stopPropagation();
              zoomCtl.zoomOut();
            }}
            className="text-overlay-fg hover:bg-overlay-fg/15 size-6"
          />
          <IconButton
            size="icon-xs"
            variant="ghost"
            icon={<IconZoomIn size={14} />}
            label={zoomInLabel ?? ""}
            disabled={!zoomCtl.canZoomIn}
            onClick={(e) => {
              e.stopPropagation();
              zoomCtl.zoomIn();
            }}
            className="text-overlay-fg hover:bg-overlay-fg/15 size-6"
          />
          <IconButton
            size="icon-xs"
            variant="ghost"
            icon={<IconZoomReset size={14} />}
            label={resetZoomLabel ?? ""}
            disabled={zoomCtl.zoom === 1}
            onClick={(e) => {
              e.stopPropagation();
              zoomCtl.resetZoom();
            }}
            className="text-overlay-fg hover:bg-overlay-fg/15 size-6"
          />
        </div>
      )}
    </div>
  );
}
