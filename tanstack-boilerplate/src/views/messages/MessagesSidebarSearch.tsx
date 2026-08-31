"use client";

import { InputWithIcon } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconSearch } from "@tabler/icons-react";
import type { MessagesSidebarSearchProps } from "@/types/messages/MessagesSidebarSearch-types";

export function MessagesSidebarSearch({
  search,
  setSearch,
}: MessagesSidebarSearchProps) {
  const t = useMessages("messages");

  return (
    <div className="px-5 py-3">
      <InputWithIcon
        icon={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t.searchChats}
        className="border-0"
      />
    </div>
  );
}
