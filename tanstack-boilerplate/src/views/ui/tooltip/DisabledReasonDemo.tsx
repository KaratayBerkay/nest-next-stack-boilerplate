"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { IconButton } from "@/components/ui/button/icon-button";

const boldIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const italicIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="19" x2="10" y1="4" y2="4" />
    <line x1="14" x2="5" y1="20" y2="20" />
    <line x1="15" x2="9" y1="4" y2="20" />
  </svg>
);

const underlineIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 4v6a6 6 0 0 0 12 0V4" />
    <line x1="4" x2="20" y1="20" y2="20" />
  </svg>
);

const strikethroughIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <line x1="4" x2="20" y1="12" y2="12" />
  </svg>
);

export function DisabledReasonDemo() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Form Field Tooltips</h3>
        <div className="surface max-w-sm space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="email">Email</Label>
              <Tooltip side="top">
                <TooltipTrigger asChild>
                  <IconButton
                    icon="?"
                    size="icon-xs"
                    variant="ghost"
                    className="h-4 w-4 rounded-full border text-[10px]"
                    label="Email info"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  We&apos;ll never share your email.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input id="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="password">Password</Label>
              <Tooltip side="top">
                <TooltipTrigger asChild>
                  <IconButton
                    icon="?"
                    size="icon-xs"
                    variant="ghost"
                    className="h-4 w-4 rounded-full border text-[10px]"
                    label="Password info"
                  />
                </TooltipTrigger>
                <TooltipContent>Must be at least 8 characters.</TooltipContent>
              </Tooltip>
            </div>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Navigation Tooltips</h3>
        <div className="surface inline-flex items-center gap-1 p-2">
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <IconButton
                icon={boldIcon}
                variant="ghost"
                size="icon-sm"
                label="Bold"
              />
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <IconButton
                icon={italicIcon}
                variant="ghost"
                size="icon-sm"
                label="Italic"
              />
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <IconButton
                icon={underlineIcon}
                variant="ghost"
                size="icon-sm"
                label="Underline"
              />
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
          <Tooltip side="top">
            <TooltipTrigger asChild>
              <IconButton
                icon={strikethroughIcon}
                variant="ghost"
                size="icon-sm"
                label="Strikethrough"
              />
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}
