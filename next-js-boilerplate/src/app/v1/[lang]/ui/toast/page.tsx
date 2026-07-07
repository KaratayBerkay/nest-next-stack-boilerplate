"use client";

import { ToastProvider, ToastViewport, useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Suspense } from "react";

function DemoControls() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        data-testid="toast-default-btn"
        onClick={() =>
          toast({
            title: "Default Toast",
            description: "This is a default toast notification.",
          })
        }
      >
        Show Default Toast
      </Button>
      <Button
        variant="destructive"
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
      </Button>
      <Button
        variant="primary"
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
      </Button>
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
