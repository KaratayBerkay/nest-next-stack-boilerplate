/** Counts user-facing letters (Unicode code points) in a message body. */
export function countLetters(text: string): number {
  return Array.from(text ?? '').length;
}
