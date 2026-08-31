// Compat shim for `next/cache`.
// TanStack Start has no ISR-style server data cache; loader freshness is
// driven by router invalidation and TanStack Query. These become no-ops
// (revalidate*) or pass-throughs (unstable_cache), preserving call sites.

export function revalidatePath(
  _path: string,
  _type?: "page" | "layout",
): void {}

export function revalidateTag(_tag: string): void {}

export function unstable_cache<T extends (...args: Array<never>) => unknown>(
  fn: T,
  _keyParts?: Array<string>,
  _options?: { revalidate?: number | false; tags?: Array<string> },
): T {
  return fn;
}

export function unstable_noStore(): void {}

export function unstable_expirePath(_path: string): void {}

export function unstable_expireTag(_tag: string): void {}
