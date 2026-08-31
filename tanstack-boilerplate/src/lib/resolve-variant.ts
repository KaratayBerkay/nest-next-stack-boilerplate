/**
 * Safely resolve a variant key from a variant map, falling back to
 * `map.default` when the key is missing or undefined.
 *
 * Eliminates the silent-undefined problem of `map[key as keyof typeof map]`
 * when the global component style (shiny/glass/neon/gradient) doesn't match
 * any key in the map.
 */
export function resolveVariant<M extends Record<string, string>>(
  map: M,
  key: string | undefined,
): string {
  return (key && map[key]) || map.default;
}
