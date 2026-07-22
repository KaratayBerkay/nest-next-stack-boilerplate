import type { ChangeEvent, KeyboardEvent } from "react";

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
}

export interface SendButtonProps {
  useNativeControls: boolean;
  onClick: () => void;
  disabled: boolean;
  label: string;
}
