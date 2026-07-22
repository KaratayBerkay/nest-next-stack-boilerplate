"use client";

import { IconMenu2 } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function EmptyChatState() {
  const t = useMessages("messages");
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <IconMenu2 size={32} className="text-muted" />
        <p className="text-muted text-sm">{t.selectConversation}</p>
      </div>
    </div>
  );
}
