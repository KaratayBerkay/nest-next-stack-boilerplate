"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/Tooltip";

export function IconButtonRealActions() {
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Real Actions</h3>
      <div className="flex flex-wrap items-center gap-3">
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
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              }
              label="Copy"
              variant="outline"
              size="icon"
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            />
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
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
                  className={spinning ? "animate-spin" : ""}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              }
              label="Refresh"
              variant="outline"
              size="icon"
              onClick={() => {
                setSpinning(true);
                setTimeout(() => setSpinning(false), 1000);
              }}
            />
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
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
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              }
              label="Delete"
              variant="destructive"
              size="icon"
              onClick={() => {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 1500);
              }}
            />
          </TooltipTrigger>
          <TooltipContent>
            {confirmDelete ? "Deleted" : "Delete"}
          </TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
