"use client";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button/icon-button";
import { Input } from "@/components/ui/Input";
import { IconX, IconMenu2, IconCrown } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type {
  SidebarCloseButtonProps,
  RoomButtonProps,
  HamburgerButtonProps,
  MessageInputProps,
  SendButtonProps,
} from "@/types/chat-room/ChatRoomSubComponent-types";

export function SidebarCloseButton({ useNativeControls, onClick }: SidebarCloseButtonProps) {
  if (useNativeControls) {
    return <IconButton icon={<IconX size={18} />} label="Close rooms sidebar" onClick={onClick} />;
  }
  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} aria-label="Close rooms sidebar">
      <IconX size={18} />
    </Button>
  );
}

export function RoomButton({ useNativeControls, room, isActive, count, isVip, onSelect }: RoomButtonProps) {
  if (useNativeControls) {
    return (
      <button
        onClick={onSelect}
        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          isActive ? "bg-brand text-brand-fg" : "text-muted hover:bg-surface-hover"
        }`}
      >
        <span className="flex items-center gap-1">
          {isVip && <IconCrown size={12} stroke={2} className="text-brand" />}# {room}
        </span>
        {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
      </button>
    );
  }
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
      <span># {room}</span>
      {count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
    </Button>
  );
}

export function HamburgerButton({ useNativeControls, onClick, ariaLabel, room, countLabel }: HamburgerButtonProps) {
  const content = (
    <>
      <IconMenu2 size={18} className="text-muted shrink-0" />
      <span className="text-sm font-semibold"># {room}</span>
      <span className="text-muted text-xs">{countLabel}</span>
    </>
  );
  if (useNativeControls) {
    return (
      <button onClick={onClick} className="hover:bg-surface-hover flex w-full items-center gap-2 md:hidden" aria-label={ariaLabel}>
        {content}
      </button>
    );
  }
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="w-full justify-start gap-2 md:hidden" aria-label={ariaLabel}>
      {content}
    </Button>
  );
}

export function MessageInput({ useNativeControls, value, onChange, onKeyDown, placeholder, disabled }: MessageInputProps) {
  if (useNativeControls) {
    return <input value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} className="rounded border px-3 py-2 text-sm disabled:opacity-50" />;
  }
  return <Input value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} />;
}

export function SendButton({ useNativeControls, onClick, disabled, label }: SendButtonProps) {
  if (useNativeControls) {
    return (
      <button onClick={onClick} disabled={disabled} className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm disabled:opacity-50">
        {label}
      </button>
    );
  }
  return (
    <Button variant="primary" size="sm" onClick={onClick} disabled={disabled} className="rounded-lg px-4 py-2">
      {label}
    </Button>
  );
}
