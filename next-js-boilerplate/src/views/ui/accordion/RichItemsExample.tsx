"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FaqSection } from "@/views/ui/accordion/FaqSection";
import { UserProfileSection } from "@/views/ui/accordion/UserProfileSection";

export function RichItemsExample() {
  const t = useMessages("accordion");

  return (
    <>
      <FaqSection {...t} />
      <UserProfileSection {...t} />
    </>
  );
}
