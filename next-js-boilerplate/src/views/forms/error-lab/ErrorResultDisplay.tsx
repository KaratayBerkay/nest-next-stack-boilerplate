"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { exceptionHandler } from "@/lib/exception-handler";
import { useAllMessages } from "@/lib/i18n/MessagesProvider";
import type { ErrorResultDisplayProps } from "@/types/views/forms/ErrorResultDisplay-types";

export function ErrorResultDisplay({ result, label }: ErrorResultDisplayProps) {
  const allMessages = useAllMessages();
  if (!result) return null;

  const isSuccess = result.exc === "OK";
  const message = exceptionHandler(result, allMessages);
  const statusCode = "statusCode" in result ? result.statusCode : undefined;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium">{label}</p>
      <Alert
        variant={isSuccess ? "success" : "error"}
        upper={`${result.exc}${statusCode ? ` · ${statusCode}` : ""}`}
      >
        <AlertTitle>{message}</AlertTitle>
        {(result.key || result.field || result.fields?.length) && (
          <AlertDescription className="mt-1 flex flex-col gap-0.5 font-mono opacity-70">
            {result.key && <span>key: {result.key}</span>}
            {result.field && <span>field: {result.field}</span>}
            {result.fields?.map((f) => (
              <span key={f.field}>
                {f.field}: {f.msg}
              </span>
            ))}
          </AlertDescription>
        )}
      </Alert>
    </div>
  );
}
