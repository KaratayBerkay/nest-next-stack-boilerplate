"use client";

import { ToastProvider, ToastViewport, useToast } from "@/components/ui/Toast";
import { Suspense } from "react";

function DemoControls() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        data-testid="toast-default-btn"
        onClick={() =>
          toast({
            title: "Default Toast",
            description: "This is a default toast notification.",
          })
        }
      >
        Show Default Toast
      </button>
      <button
        type="button"
        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
        data-testid="toast-destructive-btn"
        onClick={() =>
          toast({
            title: "Error",
            description: "Something went wrong.",
            variant: "destructive",
          })
        }
      >
        Show Destructive Toast
      </button>
      <button
        type="button"
        className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
        data-testid="toast-success-btn"
        onClick={() =>
          toast({
            title: "Success",
            description: "Operation completed successfully.",
            variant: "success",
          })
        }
      >
        Show Success Toast
      </button>
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="toast-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Toast</h2>
        <p className="text-muted text-sm">
          A notification toast with different variants.
        </p>
      </div>

      <ToastProvider>
        <DemoControls />
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <Content />
    </Suspense>
  );
}
