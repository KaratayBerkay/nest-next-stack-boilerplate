"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FieldInfoButtonProps } from "@/types/ui/FieldInfoButton-types";

export function FieldInfoButton({ description }: FieldInfoButtonProps) {
  return (
    <Tooltip side="right" delay={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted hover:text-fg inline-flex items-center transition-colors"
          aria-label={description}
        >
          <IconInfoCircle size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
