"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { avatarExamples } from "@/views/ui/avatar/examples";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

export default function AvatarPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Avatar"
      intro="An image element with a fallback for representing the user."
      examples={avatarExamples}
      initialTab={initialTab}
    />
  );
}
