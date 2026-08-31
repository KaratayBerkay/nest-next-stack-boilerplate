import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

export interface SidebarCloseButtonProps {
  onClick: () => void;
  label: string;
}

export interface RoomButtonProps {
  room: string;
  isActive: boolean;
  count: number;
  isVip: boolean;
  onSelect: () => void;
}

export interface HamburgerButtonProps {
  onClick: () => void;
  ariaLabel: string;
  room: string;
  countLabel: string;
}

export interface MessageInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
}

export interface AttachButtonProps {
  disabled: boolean;
  onAttachFile: (files: File[]) => void;
  label: string;
}

export interface EmojiButtonProps {
  disabled: boolean;
  onEmojiSelect: (emoji: string) => void;
  label: string;
  chatWindowRef?: RefObject<HTMLDivElement | null>;
}
