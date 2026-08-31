/**
 * Inserts an emoji at the input's caret (replacing any selection) and
 * restores the caret right after it once the controlled value has been
 * re-rendered. Shared by the DM and chat-room composers, which carried
 * identical private copies.
 */
export function insertEmojiAtCursor(
  input: string,
  setInput: (value: string) => void,
  inputRef: React.RefObject<HTMLInputElement | null>,
  emoji: string,
) {
  const el = inputRef.current;
  const start = el?.selectionStart ?? input.length;
  const end = el?.selectionEnd ?? start;
  const next = input.slice(0, start) + emoji + input.slice(end);
  setInput(next);
  requestAnimationFrame(() => {
    const node = inputRef.current;
    if (!node) return;
    const pos = start + emoji.length;
    node.setSelectionRange(pos, pos);
  });
}
