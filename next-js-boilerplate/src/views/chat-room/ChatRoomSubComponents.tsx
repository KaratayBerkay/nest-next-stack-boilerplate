import type { ChangeEvent } from "react";
import { useId } from "react";
import {
  IconPaperclip,
  IconX,
  IconMenu2,
  IconCrown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";
import { cn } from "@/lib/cn";
import { ATTACHMENT_ACCEPT } from "@/constants/upload";
import type {
  SidebarCloseButtonProps,
  RoomButtonProps,
  HamburgerButtonProps,
  MessageInputProps,
  SendButtonProps,
  AttachButtonProps,
  EmojiButtonProps,
} from "@/types/chat-room/ChatRoomSubComponent-types";

export function SidebarCloseButton({
  onClick,
  label,
}: SidebarCloseButtonProps) {
  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} aria-label={label}>
      <IconX size={18} />
    </Button>
  );
}

export function RoomButton({
  room,
  isActive,
  count,
  isVip,
  onSelect,
}: RoomButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSelect}
      className={cn(
        "w-full justify-between gap-2 rounded-lg px-3 py-2",
        isActive ? "bg-brand hover:bg-brand/90 text-brand-fg" : "text-muted",
      )}
    >
      <span className="flex items-center gap-1">
        {isVip && <IconCrown size={12} stroke={2} className="text-brand" />}#{" "}
        {room}
      </span>
      {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
    </Button>
  );
}

export function HamburgerButton({
  onClick,
  ariaLabel,
  room,
  countLabel,
}: HamburgerButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-full justify-start gap-2 md:hidden"
      aria-label={ariaLabel}
    >
      <IconMenu2 size={18} className="text-muted shrink-0" />
      <span className="text-sm font-semibold"># {room}</span>
      <span className="text-muted text-xs">{countLabel}</span>
    </Button>
  );
}

export function MessageInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  inputRef,
}: MessageInputProps) {
  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export function SendButton({ onClick, disabled, label }: SendButtonProps) {
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-4 py-2"
    >
      {label}
    </Button>
  );
}

function handleFileChange(
  e: ChangeEvent<HTMLInputElement>,
  onAttachFile: (files: File[]) => void,
) {
  const files = Array.from(e.target.files ?? []);
  if (files.length > 0) onAttachFile(files);
  e.target.value = "";
}

export function AttachButton({
  disabled,
  onAttachFile,
  label,
}: AttachButtonProps) {
  const inputId = useId();
  return (
    <>
      <input
        id={inputId}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(e) => handleFileChange(e, onAttachFile)}
      />
      <label
        htmlFor={inputId}
        aria-label={label}
        className="text-muted hover:bg-surface-hover flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50"
      >
        <IconPaperclip size={18} />
      </label>
    </>
  );
}

export function EmojiButton({
  disabled,
  onEmojiSelect,
  label,
  chatWindowRef,
}: EmojiButtonProps) {
  return (
    <EmojiPickerButton
      label={label}
      disabled={disabled}
      onEmojiSelect={onEmojiSelect}
      matchWidthRef={chatWindowRef}
      className="size-9"
    />
  );
}
