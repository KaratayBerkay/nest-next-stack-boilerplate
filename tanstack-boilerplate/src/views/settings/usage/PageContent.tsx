"use client";

import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsUsagePageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { UploadStorageCard } from "@/views/settings/usage/UploadStorageCard";
import { MessageStorageCard } from "@/views/settings/usage/MessageStorageCard";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

export default function UsagePageContent({ className }: ClassNameProps) {
  const t = useMessages("settings");

  return (
    <div className={className}>
      <PageHeader
        title={t.usageHeading}
        actions={<PageInfoButton content={settingsUsagePageInfo} />}
      />
      <div className="mt-6 flex flex-col gap-6">
        <UploadStorageCard />
        <MessageStorageCard />
      </div>
    </div>
  );
}
