"use client";

import { useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button/icon-button";
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
      <IconButton
        icon={<IconInfoCircle size={16} />}
        label={`About ${content.title}`}
        size="icon-xs"
        className={cn("rounded-full", className)}
        onClick={() => setOpen(true)}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {content.sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <h3 className="text-fg text-sm font-medium">{section.title}</h3>
              <p className="text-muted text-xs leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}

          {content.tips && content.tips.length > 0 && (
            <div className="border-border bg-surface rounded-lg border p-3">
              <p className="text-fg mb-1.5 text-xs font-medium">Tips</p>
              <ul className="flex flex-col gap-1">
                {content.tips.map((tip) => (
                  <li key={tip} className="text-muted text-xs">
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
