"use client";

import {
  useCallback,
  useId,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { IconPaperclip, IconSend } from "@tabler/icons-react";
import { ATTACHMENT_ACCEPT } from "@/constants/upload";
import { useTypingIndicator } from "@/hooks/messages/useTypingIndicator";
import type { ChatInputBarProps } from "@/types/messages/ChatInputBar-types";

function handleFileChange(
  e: ChangeEvent<HTMLInputElement>,
  onAttachFile: (files: File[]) => void,
) {
  const files = Array.from(e.target.files ?? []);
  if (files.length > 0) onAttachFile(files);
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

function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, doSend: () => void) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    doSend();
  }
}

export function ChatInputBar({
  input,
  setInput,
  messageError,
  handleSend,
  connectionState,
  inputPlaceholder,
  connectingLabel,
  attachFileLabel,
  insertEmojiLabel,
  sendLabel,
  recipientId,
  onTypingStart,
  onTypingStop,
  attaching,
  uploadItems,
  onAttachFiles,
  chatWindowRef,
}: ChatInputBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const attachInputId = useId();
  const { resetTyping, notifyTyping } = useTypingIndicator(
    recipientId,
    onTypingStart,
    onTypingStop,
  );

  const handleChange = useCallback(
    (value: string) => {
      setInput(value);
      notifyTyping(value);
    },
    [setInput, notifyTyping],
  );

  const doSend = useCallback(() => {
    // Block send while attachments are pending — WhatsApp-style, the modal's
    // Send is the only path that ships them together.
    if (attaching || uploadItems.length > 0) return;
    resetTyping();
    handleSend();
  }, [attaching, uploadItems.length, resetTyping, handleSend]);

  const online = connectionState === "online";

  return (
    <div className="flex items-end gap-3 border-t px-5 py-4">
      <div className="flex shrink-0 items-center gap-1">
        <input
          id={attachInputId}
          type="file"
          accept={ATTACHMENT_ACCEPT}
          multiple
          disabled={!online || attaching}
          className="sr-only"
          onChange={(e) => handleFileChange(e, onAttachFiles)}
        />
        <label
          htmlFor={attachInputId}
          aria-label={attachFileLabel}
          className={`text-muted hover:bg-surface-hover flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors ${
            !online || attaching ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <IconPaperclip size={20} />
        </label>
        <EmojiPickerButton
          label={insertEmojiLabel}
          disabled={!online}
          onEmojiSelect={(emoji) =>
            insertEmojiAtCursor(input, setInput, inputRef, emoji)
          }
          matchWidthRef={chatWindowRef}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, doSend)}
          placeholder={online ? inputPlaceholder : connectingLabel}
          disabled={!online}
          className="border-0"
        />
        {messageError && (
          <p className="text-error mt-1.5 text-xs">{messageError}</p>
        )}
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={doSend}
        disabled={
          !online || attaching || uploadItems.length > 0 || !input.trim()
        }
        className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-3"
      >
        <span className="hidden sm:inline">{sendLabel}</span>
        <IconSend size={16} />
      </Button>
    </div>
  );
}
