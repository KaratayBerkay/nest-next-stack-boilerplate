/**
 * Deterministic local placeholder for template demo imagery — same seed →
 * same image, offline-safe, on-brand, and consistent across themes (no
 * external photo service involved). Files live in /public/img/placeholders
 * (8 designs per aspect bucket).
 */

export type PlaceholderAspect =
  "1x1" | "4x3" | "3x2" | "16x9" | "2x1" | "4x5" | "3x4" | "1x2";

export function placeholderImage(
  seed: string,
  aspect: PlaceholderAspect = "4x3",
): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `/img/placeholders/ph-${aspect}-${hash % 8}.webp`;
}
