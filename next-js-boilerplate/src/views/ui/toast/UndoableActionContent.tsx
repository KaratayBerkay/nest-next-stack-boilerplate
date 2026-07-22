"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export function UndoableActionContent() {
  const { toast } = useToast();
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-xs">
        Deleted items: {count}. Click undo to restore.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setCount((c) => c + 1);
            toast({
              title: "Item deleted",
              description: "The item has been moved to trash.",
              action: (
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs font-medium"
                  onClick={() => setCount((c) => Math.max(0, c - 1))}
                >
                  Undo
                </Button>
              ),
            });
          }}
        >
          Delete Item
        </Button>
      </div>
    </div>
  );
}
