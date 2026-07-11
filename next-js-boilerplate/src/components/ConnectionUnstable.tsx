"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import type { ConnectionUnstableProps } from "@/types/components/ConnectionUnstable-types";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function ConnectionUnstable({
  title,
  description,
}: ConnectionUnstableProps) {
  const t = useMessages("error");
  return (
    <div className="flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>{title ?? t.connectionLost}</AlertTitle>
        <AlertDescription>{description ?? t.tryingToReconnect}</AlertDescription>
      </Alert>
    </div>
  );
}
