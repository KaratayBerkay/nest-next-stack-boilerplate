/**
 * Join conditional class names into a single string.
 *
 * Intentionally dependency-free for the boilerplate baseline. If you later need
 * Tailwind class de-duplication/merging, swap this for `clsx` + `tailwind-merge`.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
