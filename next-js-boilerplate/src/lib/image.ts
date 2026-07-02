import { clientEnv } from "./env";

const SIZE_SUFFIXES = {
  badge: "-badge",
  medium: "-medium",
  full: "-full",
} as const;

const MINIO_HOST = clientEnv.NEXT_PUBLIC_MINIO_PUBLIC_URL;

export function imageUrl(
  url: string | null | undefined,
  size: keyof typeof SIZE_SUFFIXES = "full",
): string | undefined {
  if (!url) return undefined;

  let result = url;

  if (result.includes("localhost:9000")) {
    result = result.replace("http://localhost:9000", MINIO_HOST);
  }

  for (const suffix of Object.values(SIZE_SUFFIXES)) {
    if (result.includes(suffix)) {
      return result.replace(suffix, SIZE_SUFFIXES[size]);
    }
  }
  return result;
}
