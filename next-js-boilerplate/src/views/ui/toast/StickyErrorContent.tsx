"use client";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export function StickyErrorContent() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            title: "Connection lost",
            description:
              "Unable to reach the server. This toast will not auto-dismiss.",
            variant: "destructive",
          })
        }
      >
        Trigger Sticky Error
      </Button>
    </div>
  );
}
