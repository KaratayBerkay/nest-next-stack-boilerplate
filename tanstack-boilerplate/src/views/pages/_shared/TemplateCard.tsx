"use client";

import { LazyMount } from "./LazyMount";
import { ScaledPreview } from "./ScaledPreview";
import type { TemplateCardProps } from "@/types/pages/TemplateBrowser-types";

/**
 * The preview renders full templates (which contain their own buttons and
 * links), so the card cannot itself be a <button> around them. Instead the
 * label zone is the real button and stretches its hit area over the whole
 * card with an ::after overlay — no invalid nesting, one tab stop.
 */
export function TemplateCard({ example, onOpen }: TemplateCardProps) {
  return (
    <div className="border-border bg-surface relative flex flex-col overflow-hidden rounded-lg border shadow-xs transition-all hover:shadow-md">
      <LazyMount
        placeholder={
          <div className="bg-surface-hover/50 aspect-[16/10] w-full animate-pulse motion-reduce:animate-none" />
        }
      >
        <ScaledPreview>{example.render()}</ScaledPreview>
      </LazyMount>
      <button
        type="button"
        onClick={onOpen}
        className="border-border bg-surface hover:bg-surface-hover focus-visible:after:ring-brand flex w-full flex-col gap-0.5 border-t p-3 text-left transition-colors after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2"
      >
        <span className="text-sm font-medium">{example.title}</span>
        <span className="text-muted line-clamp-2 text-xs leading-relaxed">
          {example.description}
        </span>
      </button>
    </div>
  );
}
