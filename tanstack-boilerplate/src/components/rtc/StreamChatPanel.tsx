"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChatLinkCard } from "@/components/ChatLinkCard";
import { extractLinks } from "@/lib/chat/link-preview";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import type { RoomChatMessage } from "@/hooks/rtc/useRoomChat";

interface StreamChatPanelProps {
  title: string;
  chat: RoomChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
  emptyLabel: string;
  placeholder: string;
  inputLabel: string;
  sendLabel: string;
}

/**
 * Twitch-style chat sidebar shared by the go-live and stream-viewer pages —
 * these two views previously carried byte-identical private copies. The dark
 * neutral chrome is the deliberate committed look of the streaming pages
 * (independent of the app theme), matching their `bg-neutral-950` stage.
 */
export function StreamChatPanel({
  title,
  chat,
  chatInput,
  onChatInputChange,
  onSendChat,
  emptyLabel,
  placeholder,
  inputLabel,
  sendLabel,
}: StreamChatPanelProps) {
  // Sticks to the newest message only while the reader is already at the
  // bottom — the previous unconditional scrollIntoView yanked the pane down
  // on every incoming message, even mid-scrollback.
  const { bottomRef } = useAutoScroll(chat);

  return (
    <div className="flex h-full flex-col rounded-r-lg bg-neutral-900">
      <div className="border-b border-neutral-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-4 py-2">
        {chat.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            {emptyLabel}
          </p>
        ) : (
          chat.map((m) => (
            <div key={m.id} className="py-1 text-sm leading-snug">
              <span className="font-semibold text-white">{m.senderName}</span>
              <span className="ml-1.5 text-neutral-300">{m.text}</span>
              {extractLinks(m.text).map((link) => (
                <div key={link.url} className="mt-1">
                  <ChatLinkCard url={link.url} clickable={link.clickable} />
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-neutral-700 p-3">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSendChat();
            }}
            placeholder={placeholder}
            aria-label={inputLabel}
            className="border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
          <Button size="sm" onClick={onSendChat} disabled={!chatInput.trim()}>
            {sendLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
