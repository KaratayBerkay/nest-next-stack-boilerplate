"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useId,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/Button";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import {
  IconPaperclip,
  IconSend,
  IconX,
  IconFileText,
  IconPhoto,
} from "@tabler/icons-react";
import { ATTACHMENT_ACCEPT } from "@/constants/upload";
import type { ChatInputBarProps } from "@/types/messages/ChatInputBar-types";

const TYPING_TIMEOUT_MS = 3000;

function handleFileChange(
  e: ChangeEvent<HTMLInputElement>,
  onAttachFile: (file: File) => void,
) {
  const file = e.target.files?.[0];
  if (file) onAttachFile(file);
  e.target.value = "";
}

function insertEmojiAtCursor(
  input: string,
  setInput: Dispatch<SetStateAction<string>>,
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
  attaching,
  pendingAttachment,
  onAttachFile,
  onRemoveAttachment,
}: ChatInputBarProps) {
  const isTypingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachInputId = useId();

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
    // Block send while the attachment upload is in flight — sending early
    // silently drops the attachment (F35).
    if (attaching) return;
    sendTypingStop();
    handleSend();
  }, [attaching, sendTypingStop, handleSend]);

  const online = connectionState === "online";

  return (
    <div className="flex items-end gap-3 border-t px-5 py-4">
      <div className="flex shrink-0 items-center gap-1">
        <input
          id={attachInputId}
          type="file"
          accept={ATTACHMENT_ACCEPT}
          disabled={!online || attaching}
          className="sr-only"
          onChange={(e) => handleFileChange(e, onAttachFile)}
        />
        <label
          htmlFor={attachInputId}
          aria-label="Attach file"
          className={`text-muted hover:bg-surface-hover flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors ${
            !online || attaching ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <IconPaperclip size={20} />
        </label>
        <EmojiPickerButton
          label="Insert emoji"
          disabled={!online}
          onEmojiSelect={(emoji) =>
            insertEmojiAtCursor(input, setInput, inputRef, emoji)
          }
        />
      </div>
      <div className="flex flex-1 flex-col">
        {pendingAttachment && (
          <div className="mb-1.5 flex items-center gap-2">
            <div className="bg-surface border-border flex w-fit items-center gap-2 rounded-md border px-2 py-1 text-xs">
              {pendingAttachment.type.startsWith("image/") ? (
                <IconPhoto size={14} className="text-muted shrink-0" />
              ) : (
                <IconFileText size={14} className="text-muted shrink-0" />
              )}
              <span className="text-fg max-w-[160px] truncate">
                {pendingAttachment.name}
              </span>
              <button
                type="button"
                onClick={onRemoveAttachment}
                aria-label="Remove attachment"
                className="text-muted hover:text-error transition-colors"
              >
                <IconX size={14} />
              </button>
            </div>
            {attaching && (
              <span className="text-muted animate-pulse text-xs">
                Uploading…
              </span>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              doSend();
            }
          }}
          placeholder={online ? inputPlaceholder : connectingLabel}
          disabled={!online}
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
        disabled={!online || attaching || (!input.trim() && !pendingAttachment)}
        className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-3"
      >
        <span className="hidden sm:inline">Send</span>
        <IconSend size={16} />
      </Button>
    </div>
  );
}
