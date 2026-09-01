"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhone,
  IconPhoneOff,
  IconVideo,
  IconVideoOff,
  IconSpeakerphone,
  IconScreenShare,
  IconScreenShareOff,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useScrollZoom } from "@/hooks/rtc/useScrollZoom";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useRtcCall } from "@/lib/rtc/RtcCallProvider";
import { participantPalette } from "@/lib/rtc/participant-color";
import { useLiveKitRoom } from "@/hooks/rtc/useLiveKitRoom";
import type { I18nMessages } from "@/generated/i18n-messages";
import type {
  IncomingCallOverlayProps,
  ActiveCallOverlayProps,
  PulsingAvatarProps,
} from "@/types/rtc/RtcCallOverlay-types";

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** In-call timer readout. Calls are duration-capped by the lower of the two
 *  parties' tiers (10/25/45/120 min — see the backend's
 *  CALL_MAX_DURATION_MINUTES), and the cap arrives on rtc:accepted as
 *  maxDurationMinutes — when present the timer reads "2:17 / 10:00" so the
 *  remaining allowance is always visible. Exported for tests. */
export function formatCallTimer(
  elapsedSeconds: number,
  maxDurationMinutes?: number | null,
): string {
  const elapsed = formatDuration(elapsedSeconds);
  if (!maxDurationMinutes) return elapsed;
  return `${elapsed} / ${formatDuration(maxDurationMinutes * 60)}`;
}

type RtcMessages = I18nMessages["rtc"];

// Matches the stable, snake_case `reason` codes RtcCallService.sendError()
// sends over the wire (see nest-js-boilerplate/src/rtc/rtc-call.service.ts).
// These used to be full English sentences ('That user is offline', 'Busy',
// 'You cannot call yourself', 'Call is no longer available') string-matched
// verbatim — any future wording tweak on either side would have silently
// fallen through to the generic default with no visible failure.
function getCallErrorMessage(reason: string, t: RtcMessages): string {
  switch (reason) {
    case "callee_offline":
      return t.userOffline;
    case "busy":
      return t.userBusy;
    case "self_call":
      return t.cannotCallSelf;
    case "call_unavailable":
      return t.callUnavailable;
    case "realtime_unavailable":
      return t.connectionUnavailable;
    default:
      return t.callErrorDescription;
  }
}

function getMediaErrorMessage(
  error: ActiveCallOverlayProps["livekitError"],
  t: RtcMessages,
): string | null {
  if (error === "connection") return t.connectionUnavailable;
  if (error === "microphone") return t.microphoneUnavailable;
  if (error === "camera") return t.cameraUnavailable;
  return null;
}

/** Speaker preference keyed by call — a toggle from an earlier call must
 *  never leak into the next one (the overlay stays mounted across calls). */
interface SpeakerState {
  callId: string | null;
  enabled: boolean;
}

function toggleSpeaker(
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>,
  setSpeakerState: React.Dispatch<React.SetStateAction<SpeakerState>>,
  callId: string | null,
  currentEnabled: boolean,
): void {
  const next = !currentEnabled;
  if (remoteAudioRef.current) remoteAudioRef.current.muted = !next;
  setSpeakerState({ callId, enabled: next });
}

function PulsingAvatar({ avatarUrl, name, paletteKey }: PulsingAvatarProps) {
  const palette = participantPalette(paletteKey);
  return (
    <div className="relative flex items-center justify-center">
      <span className="bg-success/20 absolute size-36 animate-ping rounded-full" />
      <span className="bg-success/15 absolute size-32 animate-ping rounded-full [animation-delay:0.2s]" />
      <span className="bg-success/10 absolute size-28 animate-ping rounded-full [animation-delay:0.4s]" />
      <Avatar
        src={avatarUrl ?? undefined}
        fallback={name || "?"}
        size="xl"
        className="ring-success/40 relative size-24 shadow-xl ring-4"
        style={{ background: palette.fill, color: palette.onFill }}
      />
    </div>
  );
}

/** Breathing-ring avatar for a camera-off tile — the big center placeholder,
 *  the local PIP fallback, and (once screen share can shrink either camera
 *  to a small tile) the peer's PIP fallback all use this same treatment. */
function SpeakingAvatar({
  avatarUrl,
  name,
  palette,
  speaking,
  size,
  avatarClassName,
  avatarStyle,
}: {
  avatarUrl: string | null;
  name: string;
  palette: ReturnType<typeof participantPalette>;
  speaking: boolean;
  size: "lg" | "xl";
  avatarClassName: string;
  avatarStyle?: CSSProperties;
}) {
  return (
    <div className="relative flex items-center justify-center">
      {speaking && (
        <>
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
      <Avatar
        src={avatarUrl ?? undefined}
        fallback={name || "?"}
        size={size}
        className={avatarClassName}
        style={{
          ...avatarStyle,
          boxShadow: speaking ? `0 0 0 2px ${palette.ring}` : undefined,
        }}
      />
    </div>
  );
}

function IncomingCallOverlay({
  peerId,
  peerName,
  peerAvatarUrl,
  hasVideo,
  accepting,
  onAccept,
  onDecline,
}: IncomingCallOverlayProps) {
  const t = useMessages("rtc");
  const palette = participantPalette(peerId || peerName);

  return (
    <div className="animate-fade-in bg-overlay text-overlay-fg fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <div className="bg-bg/90 border-border/70 relative flex w-full max-w-md flex-col items-center gap-8 rounded-2xl border p-8 shadow-xl backdrop-blur-xl sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 size-48 rounded-full blur-3xl"
          style={{ background: palette.halo }}
        />
        <div className="relative flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-70">
          {hasVideo ? (
            <IconVideo size={15} aria-hidden />
          ) : (
            <IconPhone size={15} aria-hidden />
          )}
          <span>
            {hasVideo ? t.incomingVideoCallTitle : t.incomingCallTitle}
          </span>
        </div>
        <PulsingAvatar
          avatarUrl={peerAvatarUrl}
          name={peerName}
          paletteKey={peerId || peerName}
        />
        <div className="relative text-center">
          <p className="text-overlay-fg text-2xl font-semibold">{peerName}</p>
          <p
            className="text-success mt-2 text-sm font-medium"
            aria-live="polite"
          >
            {/* Nothing is connecting while the call is still ringing — show
                the call type until Accept is pressed. */}
            {accepting
              ? t.connectingTitle
              : hasVideo
                ? t.videoCallLabel
                : t.voiceCallLabel}
          </p>
        </div>

        <div className="relative flex w-full items-center justify-center gap-8">
          <button
            type="button"
            onClick={onDecline}
            disabled={accepting}
            aria-label={t.decline}
            className="bg-error text-error-fg hover:bg-error/85 focus-visible:ring-brand flex size-16 items-center justify-center rounded-full shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <IconPhoneOff size={28} />
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={accepting}
            aria-busy={accepting || undefined}
            aria-label={accepting ? t.connectingTitle : t.accept}
            className="bg-success text-success-fg hover:bg-success/85 focus-visible:ring-brand flex size-16 items-center justify-center rounded-full shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-80"
          >
            {accepting ? <Spinner size="md" /> : <IconPhone size={28} />}
          </button>
        </div>
        <div className="relative flex w-full justify-between px-3 text-xs font-medium opacity-70">
          <span>{t.decline}</span>
          <span>{accepting ? t.connectingTitle : t.accept}</span>
        </div>
      </div>
    </div>
  );
}

function ActiveCallOverlay({
  peerId,
  peerName,
  peerAvatarUrl,
  selfName,
  selfAvatarUrl,
  hasVideo,
  phase,
  micEnabled,
  cameraEnabled,
  remoteCameraLive,
  remoteScreenShareLive,
  screenShareEnabled,
  remoteMicEnabled,
  remoteSpeaking,
  localSpeaking,
  connectedAt,
  speakerEnabled,
  actionPending,
  livekitConnected,
  livekitError,
  remoteConnected,
  maxDurationMinutes,
  warningSecondsRemaining,
  remoteVideoRef,
  localVideoRef,
  remoteAudioRef,
  remoteScreenShareRef,
  localScreenShareRef,
  onToggleMic,
  onToggleCamera,
  onToggleSpeaker,
  onToggleScreenShare,
  onHangup,
}: ActiveCallOverlayProps) {
  const t = useMessages("rtc");
  const [duration, setDuration] = useState(0);
  const callStartRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== "connected") return;
    // Seed from the server-side accept time when known (snapshot recovery
    // after a reload) so the readout continues instead of restarting at 0:00.
    const startMs = connectedAt ? new Date(connectedAt).getTime() : NaN;
    callStartRef.current = Number.isFinite(startMs) ? startMs : Date.now();
    const tick = () =>
      setDuration(
        Math.max(0, Math.floor((Date.now() - callStartRef.current) / 1000)),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, connectedAt]);

  const isRinging = phase === "outgoing-ringing";
  const showVideo = phase === "connected" && hasVideo;
  const palette = participantPalette(peerId || peerName);
  const selfPalette = participantPalette(selfName || "you");
  const mediaError = getMediaErrorMessage(livekitError, t);
  // Meet-style: an active screen share takes over the main stage and both
  // cameras shrink to small tiles — same mechanics as the meeting room's
  // auto-pinned screen tile. If both sides happen to share at once (rare —
  // LiveKit allows it, a real 1:1 UI never intends it), the peer's share
  // wins the main stage since watching the other person's content is the
  // more useful default.
  const activeShare: "remote" | "local" | null = remoteScreenShareLive
    ? "remote"
    : screenShareEnabled
      ? "local"
      : null;
  const isSharing = activeShare !== null;
  // Independent zoom state per side (only one is ever visible at a time,
  // via the `hidden` toggle below, but both videos stay permanently
  // mounted — see the comment on them — so each needs its own scroll
  // container/ref). Keyed on the live/enabled flag so a fresh share
  // session starts at 1x rather than carrying over the last one's zoom.
  const remoteScreenScrollRef = useRef<HTMLDivElement>(null);
  const localScreenScrollRef = useRef<HTMLDivElement>(null);
  const remoteZoom = useScrollZoom(
    remoteScreenScrollRef,
    remoteScreenShareLive,
  );
  const localZoom = useScrollZoom(localScreenScrollRef, screenShareEnabled);
  const activeZoom =
    activeShare === "remote"
      ? remoteZoom
      : activeShare === "local"
        ? localZoom
        : null;

  // Media errors deliberately do NOT enter this ladder: they have their own
  // banner below, and letting them occupy the readout hid the call timer for
  // the whole call whenever mic/camera access was denied. A lost LiveKit
  // connection still surfaces here naturally via !livekitConnected.
  const statusText = isRinging
    ? actionPending
      ? t.cancelling
      : t.callingTitle.replace("{name}", peerName)
    : !livekitConnected
      ? t.connectingTitle
      : !remoteConnected
        ? t.waitingForPeer.replace("{name}", peerName)
        : formatCallTimer(duration, maxDurationMinutes);

  return (
    <div className="bg-overlay text-overlay-fg fixed inset-0 z-[100] flex min-h-dvh flex-col overflow-hidden">
      {showVideo ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Header in normal flow (not overlaid on the video) — the video
              lives in a contained tile below, Meet-style. */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 sm:px-6">
            <span className="bg-overlay/45 border-overlay-fg/20 flex size-9 shrink-0 items-center justify-center rounded-full border backdrop-blur-md">
              <IconVideo size={17} aria-hidden />
            </span>
            <p className="text-overlay-fg min-w-0 truncate text-base font-semibold">
              {peerName}
            </p>
            {/* Single status readout, right next to the name. While
                connected it renders "elapsed / limit" (e.g. 2:17 / 10:00) —
                the tier-scaled cap the backend sent on rtc:accepted. */}
            <span
              className="bg-overlay/45 border-overlay-fg/20 text-overlay-fg shrink-0 rounded-full border px-3 py-1 text-xs font-medium tabular-nums backdrop-blur-md"
              aria-live="polite"
            >
              {statusText}
            </span>
          </div>

          {/* Bordered stage tile. object-contain (not cover) so the whole
              camera frame is visible — full-bleed cover cropped the top and
              bottom of the feed. */}
          <div className="min-h-0 flex-1 px-3 pb-3 sm:px-4 sm:pb-4">
            {/* Breathing speak glow on the video tile — the same treatment
                the meeting tiles use, keyed to the peer's identity color.
                Suppressed while a screen share is the main stage — the glow
                is meant for the peer's own video, not their shared screen. */}
            <div
              className={`border-overlay-fg/15 bg-bg relative h-full w-full overflow-hidden rounded-2xl border shadow-2xl ${
                remoteSpeaking && remoteCameraLive && !isSharing
                  ? "animate-speaking-glow"
                  : ""
              }`}
              style={
                {
                  "--speak-ring": palette.ring,
                  "--speak-halo": palette.halo,
                } as CSSProperties
              }
            >
              {/* Waiting/camera-off placeholder for the peer's own video —
                  only meaningful when their camera (not a shared screen) is
                  the main stage. */}
              {!isSharing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <SpeakingAvatar
                    avatarUrl={peerAvatarUrl}
                    name={peerName}
                    palette={palette}
                    speaking={remoteSpeaking && !remoteCameraLive}
                    size="xl"
                    avatarClassName="bg-brand text-brand-fg ring-brand/20 size-28 ring-4"
                    avatarStyle={{
                      background: palette.fill,
                      color: palette.onFill,
                    }}
                  />
                  <p className="text-overlay-fg text-lg font-semibold">
                    {peerName}
                  </p>
                  <p className="text-overlay-fg/70 text-sm">{statusText}</p>
                </div>
              )}

              {/* Peer's shared screen — same "Meet-style" mechanics as the
                  meeting room: while live it takes over the main stage and
                  both cameras below shrink to small tiles. Video always
                  mounted (never conditionally unmounted) so LiveKit's
                  attach() from the subscribe-time event handler survives
                  mode switches — only `hidden` toggles. The wrapping div is
                  the scroll container the zoom controls drive (see the
                  useScrollZoom calls above) — same reasoning as the
                  meeting room's screen tile: overflow-auto + a
                  percentage-sized video makes it genuinely scrollable
                  (native wheel/trackpad/scrollbar panning) rather than
                  just visually scaled with nothing to pan. */}
              <div
                ref={remoteScreenScrollRef}
                className={`absolute inset-0 overflow-auto ${activeShare === "remote" ? "" : "hidden"} ${
                  remoteZoom.isPannable
                    ? `touch-none select-none ${remoteZoom.isPanning ? "cursor-grabbing" : "cursor-grab"}`
                    : ""
                }`}
                {...remoteZoom.panHandlers}
              >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P screen share video, no caption track exists */}
                <video
                  ref={remoteScreenShareRef}
                  autoPlay
                  playsInline
                  aria-label={t.participantScreenLabel.replace(
                    "{name}",
                    peerName,
                  )}
                  className="bg-overlay pointer-events-none object-contain"
                  style={{
                    width: `${remoteZoom.zoom * 100}%`,
                    height: `${remoteZoom.zoom * 100}%`,
                  }}
                />
              </div>
              {/* Your own shared screen — same "Your screen" self-preview
                  treatment the meeting room gives a presenter. Muted (it's
                  a self-preview), so jsx-a11y/media-has-caption doesn't
                  flag it the way the other live-video elements need. */}
              <div
                ref={localScreenScrollRef}
                className={`absolute inset-0 overflow-auto ${activeShare === "local" ? "" : "hidden"} ${
                  localZoom.isPannable
                    ? `touch-none select-none ${localZoom.isPanning ? "cursor-grabbing" : "cursor-grab"}`
                    : ""
                }`}
                {...localZoom.panHandlers}
              >
                <video
                  ref={localScreenShareRef}
                  autoPlay
                  playsInline
                  muted
                  aria-label={t.yourScreenLabel}
                  className="bg-overlay pointer-events-none object-contain"
                  style={{
                    width: `${localZoom.zoom * 100}%`,
                    height: `${localZoom.zoom * 100}%`,
                  }}
                />
              </div>

              {/* Hidden (not unmounted — the track stays attached) whenever
                  the peer has no live camera track: before they join, while
                  their camera is off/denied, and after a mute. Left visible
                  in those states it painted a black/frozen frame over the
                  avatar + name placeholder behind it. Repositioned (not
                  remounted) into a small tile once a screen share takes the
                  main stage — same reasoning as the screen-share videos
                  above: the ref must stay attached to one persistent
                  element. */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P call video, no caption track exists */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={
                  isSharing
                    ? `bg-surface border-overlay-fg/25 absolute right-3 bottom-32 h-20 w-32 rounded-lg border-2 object-cover shadow-xl sm:right-4 sm:bottom-44 sm:h-24 sm:w-36 ${remoteCameraLive ? "" : "opacity-0"}`
                    : `absolute inset-0 h-full w-full object-contain ${remoteCameraLive ? "" : "opacity-0"}`
                }
              />
              {/* Peer's camera-off fallback for their small tile while a
                  share is live — the big centered placeholder above is
                  hidden in this mode, so the small tile needs its own. */}
              {isSharing && !remoteCameraLive && (
                <div className="bg-surface border-overlay-fg/25 absolute right-3 bottom-32 flex h-20 w-32 items-center justify-center rounded-lg border-2 shadow-xl sm:right-4 sm:bottom-44 sm:h-24 sm:w-36">
                  <SpeakingAvatar
                    avatarUrl={peerAvatarUrl}
                    name={peerName}
                    palette={palette}
                    speaking={remoteSpeaking}
                    size="lg"
                    avatarClassName="bg-brand text-brand-fg"
                  />
                </div>
              )}

              {/* Peer muted their mic — same badge treatment as the meeting
                  participant tiles, visible over video and avatar alike. */}
              {remoteConnected && !remoteMicEnabled && (
                <span className="bg-overlay/60 text-error absolute top-3 left-3 flex size-8 items-center justify-center rounded-full backdrop-blur-sm">
                  <IconMicrophoneOff size={16} aria-hidden />
                </span>
              )}

              {activeZoom && (
                <div className="bg-overlay/60 text-overlay-fg absolute top-3 right-3 flex items-center gap-0.5 rounded-full p-0.5 backdrop-blur-sm">
                  {/* All three buttons stay mounted (Reset only disabled,
                      not conditionally unmounted) so this row's layout
                      never shifts — see MeetingParticipantTile.tsx for the
                      misclick bug this avoids. */}
                  <IconButton
                    size="icon-xs"
                    variant="ghost"
                    icon={<IconZoomOut size={14} />}
                    label={t.zoomOut}
                    disabled={!activeZoom.canZoomOut}
                    onClick={activeZoom.zoomOut}
                    className="text-overlay-fg hover:bg-overlay-fg/15 size-6"
                  />
                  <IconButton
                    size="icon-xs"
                    variant="ghost"
                    icon={<IconZoomIn size={14} />}
                    label={t.zoomIn}
                    disabled={!activeZoom.canZoomIn}
                    onClick={activeZoom.zoomIn}
                    className="text-overlay-fg hover:bg-overlay-fg/15 size-6"
                  />
                  <IconButton
                    size="icon-xs"
                    variant="ghost"
                    icon={<IconZoomReset size={14} />}
                    label={t.resetZoom}
                    disabled={activeZoom.zoom === 1}
                    onClick={activeZoom.resetZoom}
                    className="text-overlay-fg hover:bg-overlay-fg/15 size-6"
                  />
                </div>
              )}

              <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4">
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    aria-label={t.youLabel}
                    className={`bg-surface border-overlay-fg/25 h-28 w-44 rounded-xl border-2 object-cover shadow-xl sm:h-36 sm:w-56 ${cameraEnabled ? "" : "opacity-0"}`}
                  />
                  {/* Camera off/denied: own avatar instead of a black tile.
                      The video element stays mounted so re-enabling
                      reattaches to the same ref. */}
                  {!cameraEnabled && (
                    <div
                      data-testid="self-camera-placeholder"
                      className="bg-surface border-overlay-fg/25 absolute inset-0 flex items-center justify-center rounded-xl border-2 shadow-xl"
                    >
                      <SpeakingAvatar
                        avatarUrl={selfAvatarUrl}
                        name={selfName}
                        palette={selfPalette}
                        speaking={localSpeaking}
                        size="lg"
                        avatarClassName="bg-brand text-brand-fg"
                      />
                    </div>
                  )}
                  {/* Own mute badge on the self PiP tile. */}
                  {!micEnabled && (
                    <span className="bg-overlay/60 text-error absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full backdrop-blur-sm">
                      <IconMicrophoneOff size={13} aria-hidden />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6">
          {/* Same identity wash the meeting tiles use — a voice call reads
              as that person's color, not a void. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(60% 55% at 50% 42%, ${palette.tintStrong}, transparent 75%)`,
            }}
          />
          {isRinging ? (
            <PulsingAvatar
              avatarUrl={peerAvatarUrl}
              name={peerName}
              paletteKey={peerId || peerName}
            />
          ) : (
            <Avatar
              src={peerAvatarUrl ?? undefined}
              fallback={peerName || "?"}
              size="xl"
              className="ring-brand/20 relative size-28 shadow-xl ring-4"
              style={{ background: palette.fill, color: palette.onFill }}
            />
          )}
          <div className="text-center">
            <p className="text-overlay-fg text-xl font-semibold">{peerName}</p>
            <p className="text-overlay-fg/65 mt-1 text-sm" aria-live="polite">
              {statusText}
            </p>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live P2P call audio, no caption track exists */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        aria-label={t.voiceCallLabel}
        className="sr-only"
      />

      {mediaError && (
        <div className="mx-4 mb-2 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-error/15 border-error/30 text-error rounded-lg border px-4 py-2 text-center text-sm">
            {mediaError}
          </div>
        </div>
      )}

      {warningSecondsRemaining != null && (
        <div className="mx-4 mb-2 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-warning/15 border-warning/30 text-warning rounded-lg border px-4 py-2 text-center text-sm shadow-xs">
            {t.callLimitWarning.replace(
              "{seconds}",
              String(warningSecondsRemaining),
            )}
          </div>
        </div>
      )}

      <div className="bg-overlay/75 border-overlay-fg/10 px-4 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:px-6">
        <div className="flex items-end justify-center gap-3 sm:gap-6">
          {phase === "connected" && (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <IconButton
                  variant="secondary"
                  size="icon"
                  icon={micEnabled ? <IconMicrophone /> : <IconMicrophoneOff />}
                  label={micEnabled ? t.mute : t.unmute}
                  onClick={onToggleMic}
                  className={`size-12 rounded-full ${micEnabled ? "bg-overlay/45 text-overlay-fg hover:bg-overlay/65" : "bg-error text-error-fg hover:bg-error/85"}`}
                />
                <span className="text-overlay-fg/60 text-[10px]">
                  {micEnabled ? t.mute : t.unmute}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <IconButton
                  variant="secondary"
                  size="icon"
                  icon={
                    speakerEnabled ? (
                      <IconSpeakerphone />
                    ) : (
                      <IconSpeakerphone className="opacity-50" />
                    )
                  }
                  label={speakerEnabled ? t.speakerOn : t.speakerOff}
                  onClick={onToggleSpeaker}
                  className={`size-12 rounded-full ${speakerEnabled ? "bg-overlay/45 text-overlay-fg hover:bg-overlay/65" : "bg-overlay/30 text-overlay-fg/50 hover:bg-overlay/50"}`}
                />
                <span className="text-overlay-fg/60 text-[10px]">
                  {speakerEnabled ? t.speakerOn : t.speakerOff}
                </span>
              </div>
              {hasVideo && (
                <div className="flex flex-col items-center gap-1.5">
                  <IconButton
                    variant="secondary"
                    size="icon"
                    icon={cameraEnabled ? <IconVideo /> : <IconVideoOff />}
                    label={cameraEnabled ? t.cameraOff : t.cameraOn}
                    onClick={onToggleCamera}
                    className={`size-12 rounded-full ${cameraEnabled ? "bg-overlay/45 text-overlay-fg hover:bg-overlay/65" : "bg-error text-error-fg hover:bg-error/85"}`}
                  />
                  <span className="text-overlay-fg/60 text-[10px]">
                    {cameraEnabled ? t.cameraOff : t.cameraOn}
                  </span>
                </div>
              )}
              {hasVideo && (
                <div className="flex flex-col items-center gap-1.5">
                  <IconButton
                    variant="secondary"
                    size="icon"
                    icon={
                      screenShareEnabled ? (
                        <IconScreenShareOff />
                      ) : (
                        <IconScreenShare />
                      )
                    }
                    label={
                      screenShareEnabled ? t.screenShareOff : t.screenShareOn
                    }
                    onClick={onToggleScreenShare}
                    className={`size-12 rounded-full ${screenShareEnabled ? "bg-error text-error-fg hover:bg-error/85" : "bg-overlay/45 text-overlay-fg hover:bg-overlay/65"}`}
                  />
                  <span className="text-overlay-fg/60 text-[10px]">
                    {screenShareEnabled ? t.screenShareOff : t.screenShareOn}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onHangup}
              disabled={actionPending}
              aria-busy={actionPending || undefined}
              aria-label={phase === "connected" ? t.hangup : t.cancel}
              className="bg-error text-error-fg hover:bg-error/85 focus-visible:ring-brand flex size-14 items-center justify-center rounded-full shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <IconPhoneOff size={24} />
            </button>
            <span className="text-overlay-fg/60 text-[10px]">
              {phase === "connected" ? t.hangup : t.cancel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Global overlay for the whole 1:1-call lifecycle — incoming-ring dialog,
 * outgoing-ring/connecting screen, and the in-call video/audio + controls.
 * Mounted once in V1Shell (same level as RtcCallProvider/RealtimeProvider),
 * not per-page, so a call survives navigation and can be answered from any
 * screen — mirrors how MessageDropdown/presence use app-shell-wide realtime
 * state rather than a page-scoped subscription.
 */
export function RtcCallOverlay() {
  const {
    state,
    acceptCall,
    rejectCall,
    cancelCall,
    hangupCall,
    dismissError,
  } = useRtcCall();
  const t = useMessages("rtc");
  const { toast } = useToast();
  const { user } = useAuth();
  const isConnected = state.phase === "connected";
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localScreenShareRef = useRef<HTMLVideoElement>(null);
  const remoteScreenShareRef = useRef<HTMLVideoElement>(null);
  const [speakerState, setSpeakerState] = useState<SpeakerState>({
    callId: null,
    enabled: true,
  });
  // Derived, not reset via effect: a toggle only applies to the call it was
  // made in; any other call starts with the speaker on.
  const speakerEnabled =
    speakerState.callId === state.callId ? speakerState.enabled : true;
  const livekit = useLiveKitRoom(
    isConnected ? (state.livekit?.token ?? null) : null,
    state.hasVideo,
    {
      localVideoRef,
      remoteVideoRef,
      remoteAudioRef,
      localScreenShareRef,
      remoteScreenShareRef,
    },
    state.callId,
    state.livekit?.roomName,
  );

  useEffect(() => {
    // Re-arm the element on every phase change so a new call's audio always
    // starts unmuted (the state side is handled by the call-keyed
    // speakerState derivation above).
    if (remoteAudioRef.current) remoteAudioRef.current.muted = false;
  }, [state.phase]);

  useEffect(() => {
    if (!state.lastError) return;
    toast({
      title: t.callErrorTitle,
      description: getCallErrorMessage(state.lastError, t),
      variant: "destructive",
    });
    dismissError();
  }, [dismissError, state.lastError, t, toast]);

  const handleToggleSpeaker = () =>
    toggleSpeaker(
      remoteAudioRef,
      setSpeakerState,
      state.callId,
      speakerEnabled,
    );

  if (state.phase === "idle") return null;

  if (state.phase === "incoming-ringing") {
    return (
      <IncomingCallOverlay
        peerId={state.peer?.id ?? null}
        peerName={state.peer?.name || "?"}
        peerAvatarUrl={state.peer?.avatarUrl ?? null}
        hasVideo={state.hasVideo}
        accepting={state.actionPending === "accept"}
        onAccept={acceptCall}
        onDecline={rejectCall}
      />
    );
  }

  return (
    <ActiveCallOverlay
      peerId={state.peer?.id ?? null}
      peerName={state.peer?.name || "?"}
      peerAvatarUrl={state.peer?.avatarUrl ?? null}
      selfName={user?.name || user?.username || user?.email || "?"}
      selfAvatarUrl={user?.avatarUrl ?? null}
      hasVideo={state.hasVideo}
      phase={state.phase}
      micEnabled={livekit.micEnabled}
      cameraEnabled={livekit.cameraEnabled}
      remoteCameraLive={livekit.remoteCameraLive}
      remoteScreenShareLive={livekit.remoteScreenShareLive}
      screenShareEnabled={livekit.screenShareEnabled}
      remoteMicEnabled={livekit.remoteMicEnabled}
      remoteSpeaking={livekit.remoteSpeaking}
      localSpeaking={livekit.localSpeaking}
      connectedAt={state.connectedAt}
      speakerEnabled={speakerEnabled}
      actionPending={state.actionPending !== null}
      remoteConnected={livekit.remoteConnected}
      livekitConnected={livekit.connected}
      livekitError={livekit.livekitError}
      maxDurationMinutes={state.livekit?.maxDurationMinutes ?? null}
      warningSecondsRemaining={state.warningSecondsRemaining}
      remoteVideoRef={remoteVideoRef}
      localVideoRef={localVideoRef}
      remoteAudioRef={remoteAudioRef}
      remoteScreenShareRef={remoteScreenShareRef}
      localScreenShareRef={localScreenShareRef}
      onToggleMic={livekit.toggleMic}
      onToggleCamera={livekit.toggleCamera}
      onToggleSpeaker={handleToggleSpeaker}
      onToggleScreenShare={livekit.toggleScreenShare}
      onHangup={isConnected ? hangupCall : cancelCall}
    />
  );
}
