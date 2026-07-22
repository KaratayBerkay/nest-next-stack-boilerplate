"use client";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export function VariantBasicsContent() {
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
        Show Default
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
        Show Success
      </Button>
      <Button
        variant="outline"
        data-testid="toast-info-btn"
        onClick={() =>
          toast({
            title: "Heads up",
            description: "A new version is available.",
            variant: "info",
          })
        }
      >
        Show Info
      </Button>
      <Button
        variant="outline"
        data-testid="toast-warning-btn"
        onClick={() =>
          toast({
            title: "Warning",
            description: "Please double-check your input.",
            variant: "warning",
          })
        }
      >
        Show Warning
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
        Show Destructive
      </Button>
    </div>
  );
}
