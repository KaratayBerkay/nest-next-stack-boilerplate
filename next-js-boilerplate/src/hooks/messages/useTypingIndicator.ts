import { useCallback, useEffect, useRef } from "react";

const TYPING_TIMEOUT_MS = 3000;

export function useTypingIndicator(
  recipientId: string,
  onTypingStart: (recipientId: string) => void,
  onTypingStop: (recipientId: string) => void,
) {
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTyping = useCallback(() => {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onTypingStop(recipientId);
  }, [recipientId, onTypingStop]);

  useEffect(() => {
    return () => resetTyping();
  }, [recipientId, resetTyping]);

  const notifyTyping = useCallback(
    (value: string) => {
      if (value.trim() && !isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart(recipientId);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (value.trim()) {
        timerRef.current = setTimeout(() => {
          resetTyping();
        }, TYPING_TIMEOUT_MS);
      } else {
        resetTyping();
      }
    },
    [recipientId, onTypingStart, resetTyping],
  );

  return { resetTyping, notifyTyping };
}
