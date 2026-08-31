"use client";

import { useState } from "react";
import {
  IconArrowLeft,
  IconArrowsMaximize,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCode,
  IconEye,
  IconLink,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { CodePanel } from "./CodePanel";
import type { TemplateDetailProps } from "@/types/pages/TemplateBrowser-types";

export function TemplateDetail({
  example,
  index,
  total,
  category,
  codeOpen,
  onToggleCode,
  onBack,
  onPrev,
  onNext,
  onOpenFull,
  t,
}: TemplateDetailProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the URL is already in the address bar.
    }
  };

  const position = t.positionLabel
    .replace("{current}", String(index + 1))
    .replace("{total}", String(total));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onBack}
          leftIcon={<IconArrowLeft size={14} />}
        >
          {t.backToGrid}
        </Button>
        <span className="text-muted text-xs" aria-live="polite">
          {position}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleCopyLink}
            leftIcon={
              linkCopied ? <IconCheck size={14} /> : <IconLink size={14} />
            }
          >
            {linkCopied ? t.copied : t.copyLink}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onToggleCode}
            leftIcon={codeOpen ? <IconEye size={14} /> : <IconCode size={14} />}
          >
            {codeOpen ? t.viewPreview : t.viewCode}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onOpenFull}
            leftIcon={<IconArrowsMaximize size={14} />}
          >
            {t.fullScreen}
          </Button>
          <IconButton
            type="button"
            variant="outline"
            size="icon-sm"
            label={t.previous}
            icon={<IconChevronLeft size={16} />}
            onClick={onPrev}
            disabled={index <= 0}
          />
          <IconButton
            type="button"
            variant="outline"
            size="icon-sm"
            label={t.next}
            icon={<IconChevronRight size={16} />}
            onClick={onNext}
            disabled={index >= total - 1}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{example.title}</h3>
        <p className="text-muted text-sm italic">{example.description}</p>
      </div>

      {codeOpen ? (
        <CodePanel
          key={example.id}
          category={category}
          variantId={example.id}
          copyLabel={t.copyCode}
          copiedLabel={t.copied}
          unavailableLabel={t.codeUnavailable}
        />
      ) : (
        <div>{example.render()}</div>
      )}
    </div>
  );
}
