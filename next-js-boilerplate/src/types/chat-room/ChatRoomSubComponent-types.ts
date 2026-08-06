import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

export interface SidebarCloseButtonProps {
  useNativeControls: boolean;
  onClick: () => void;
}

export interface RoomButtonProps {
  useNativeControls: boolean;
  room: string;
  isActive: boolean;
  count: number;
  isVip: boolean;
  onSelect: () => void;
}

export interface HamburgerButtonProps {
  useNativeControls: boolean;
  onClick: () => void;
  ariaLabel: string;
  room: string;
  countLabel: string;
}

export interface MessageInputProps {
  useNativeControls: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface SendButtonProps {
  useNativeControls: boolean;
  onClick: () => void;
  disabled: boolean;
  label: string;
}

export interface AttachButtonProps {
  useNativeControls: boolean;
  disabled: boolean;
  onAttachFile: (files: File[]) => void;
  label: string;
}

export interface EmojiButtonProps {
  useNativeControls: boolean;
  disabled: boolean;
  onEmojiSelect: (emoji: string) => void;
  label: string;
}
