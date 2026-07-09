"use client";

import { useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PageInfoButtonProps } from "@/types/ui/PageInfo-types";

export function PageInfoButton({ content, className }: PageInfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-muted inline-flex size-7 items-center justify-center rounded-full transition-colors",
          "hover:bg-surface-hover hover:text-fg",
          "focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
        aria-label={`About ${content.title}`}
      >
        <IconInfoCircle size={16} stroke={1.5} />
      </button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {content.sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-fg">{section.title}</h3>
              <p className="text-xs leading-relaxed text-muted">
                {section.description}
              </p>
            </div>
          ))}

          {content.tips && content.tips.length > 0 && (
            <div className="border-border rounded-lg border bg-surface p-3">
              <p className="mb-1.5 text-xs font-medium text-fg">Tips</p>
              <ul className="flex flex-col gap-1">
                {content.tips.map((tip) => (
                  <li key={tip} className="text-xs text-muted">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
