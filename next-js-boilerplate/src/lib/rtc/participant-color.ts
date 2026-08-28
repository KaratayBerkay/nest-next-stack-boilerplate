/**
 * Stable per-participant identity colors for RTC tiles, Google-Meet style:
 * the same user always lands on the same swatch (hash of their LiveKit
 * identity), so a camera-off tile is recognizable at a glance.
 *
 * These are data-driven identity colors, not theme colors — the semantic
 * token palette deliberately can't express "a distinct stable color per
 * user" (same reasoning as the dashboard chart-series constants). Every
 * value is oklch at fixed lightness/chroma so all eight hues carry equal
 * weight, and translucent variants blend over the themed surface, keeping
 * tiles legible in light and dark themes alike.
 */

/** Eight hues spread around the oklch wheel, skipping the yellow band
 *  (~60–110°) where 0.5-lightness swatches turn muddy brown. */
const HUES = [250, 210, 180, 145, 300, 335, 20, 120] as const;

export interface ParticipantPalette {
  /** Solid avatar-circle fill. */
  fill: string;
  /** Initials color on top of `fill`. */
  onFill: string;
  /** Speaking-ring / glow line color (lightened for contrast on the tile). */
  ring: string;
  /** Translucent glow shadow color. */
  halo: string;
  /** Stronger translucent wash — radial center behind the avatar. */
  tintStrong: string;
  /** Faint translucent wash — the rest of the camera-off tile. */
  tintSoft: string;
}

function hashIdentity(identity: string): number {
  let h = 0;
  for (let i = 0; i < identity.length; i++) {
    h = (h * 31 + identity.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function participantPalette(identity: string): ParticipantPalette {
  const hue = HUES[hashIdentity(identity) % HUES.length];
  return {
    fill: `oklch(0.5 0.13 ${hue})`,
    onFill: `oklch(0.985 0.01 ${hue})`,
    ring: `oklch(0.74 0.13 ${hue})`,
    halo: `oklch(0.74 0.13 ${hue} / 0.45)`,
    tintStrong: `oklch(0.6 0.12 ${hue} / 0.26)`,
    tintSoft: `oklch(0.6 0.12 ${hue} / 0.1)`,
  };
}

/** "Berkay Karatay" -> "BK"; single word -> its first two letters. */
export function participantInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
