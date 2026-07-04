"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";

interface ConnectionUnstableProps {
  title?: string;
  description?: string;
}

export function ConnectionUnstable({
  title = "Connection lost",
  description = "Trying to reconnect. Some features may be unavailable.",
}: ConnectionUnstableProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
