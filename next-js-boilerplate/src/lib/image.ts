const SIZE_SUFFIXES = {
  badge: "-badge",
  medium: "-medium",
  full: "-full",
} as const;

export function imageUrl(
  url: string | null | undefined,
  size: keyof typeof SIZE_SUFFIXES = "full",
): string | undefined {
  if (!url) return undefined;

  const result = url;

  for (const suffix of Object.values(SIZE_SUFFIXES)) {
    if (result.includes(suffix)) {
      return result.replace(suffix, SIZE_SUFFIXES[size]);
    }
  }
  return result;
}
