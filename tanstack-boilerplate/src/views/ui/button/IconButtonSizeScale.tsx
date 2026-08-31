"use client";

import { IconButton } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/Tooltip";

export function IconButtonSizeScale() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Size Scale</h3>
      <div className="flex flex-wrap items-center gap-3">
        <Tooltip>
          <TooltipTrigger>
            <IconButton
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              }
              label="Close"
              variant="outline"
              size="icon-xs"
            />
          </TooltipTrigger>
          <TooltipContent>Close (icon-xs)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <IconButton
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              }
              label="Close"
              variant="outline"
              size="icon-sm"
            />
          </TooltipTrigger>
          <TooltipContent>Close (icon-sm)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <IconButton
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              }
              label="Close"
              variant="outline"
              size="icon"
            />
          </TooltipTrigger>
          <TooltipContent>Close (icon)</TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
