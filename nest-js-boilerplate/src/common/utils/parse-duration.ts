const DURATION_RE = /^(\d+)([smhd])$/;
const MULTIPLIERS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

export function parseDurationToSeconds(raw: string, fallback = 900): number {
  const match = raw.match(DURATION_RE);
  if (!match) return fallback;
  const num = Number(match[1]);
  const unit = match[2];
  return num * (MULTIPLIERS[unit] ?? 1);
}
