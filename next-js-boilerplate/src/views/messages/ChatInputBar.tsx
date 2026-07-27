import {
  useEffect,
  useRef,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button/icon-button";
import { IconPaperclip, IconSend } from "@tabler/icons-react";

const TYPING_TIMEOUT_MS = 3000;

export interface ChatInputBarProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  messageError: string | null;
  handleSend: () => void;
  connectionState: string;
  inputPlaceholder: string;
  connectingLabel: string;
  recipientId: string;
  onTypingStart: (recipientId: string) => void;
  onTypingStop: (recipientId: string) => void;
}

export function ChatInputBar({
  input,
  setInput,
  messageError,
  handleSend,
  connectionState,
  inputPlaceholder,
  connectingLabel,
  recipientId,
  onTypingStart,
  onTypingStop,
}: ChatInputBarProps) {
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTypingStop = useCallback(() => {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onTypingStop(recipientId);
  }, [recipientId, onTypingStop]);

  // Cleanup typing on unmount / recipient change
  useEffect(() => {
    return () => {
      sendTypingStop();
    };
  }, [recipientId, sendTypingStop]);

  const handleChange = useCallback(
    (value: string) => {
      setInput(value);

      if (value.trim() && !isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart(recipientId);
      }

      if (timerRef.current) clearTimeout(timerRef.current);

      if (value.trim()) {
        timerRef.current = setTimeout(() => {
          sendTypingStop();
        }, TYPING_TIMEOUT_MS);
      } else {
        sendTypingStop();
      }
    },
    [setInput, recipientId, onTypingStart, sendTypingStop],
  );

  const doSend = useCallback(() => {
    sendTypingStop();
    handleSend();
  }, [sendTypingStop, handleSend]);

  return (
    <div className="flex items-end gap-3 border-t px-5 py-4">
      <IconButton
        icon={<IconPaperclip size={20} />}
        label="Attach file"
        variant="ghost"
        size="icon-sm"
        disabled
        className="text-muted shrink-0"
      />
      <div className="flex flex-1 flex-col">
        <input
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              doSend();
            }
          }}
          placeholder={
            connectionState === "online" ? inputPlaceholder : connectingLabel
          }
          disabled={connectionState !== "online"}
          className="bg-surface text-fg placeholder:text-muted focus:ring-brand/30 w-full rounded-lg border-0 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
        />
        {messageError && (
          <p className="text-error mt-1.5 text-xs">{messageError}</p>
        )}
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={doSend}
        disabled={connectionState !== "online" || !input.trim()}
        className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-3"
      >
        <span className="hidden sm:inline">Send</span>
        <IconSend size={16} />
      </Button>
    </div>
  );
}
