"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PAGES_MANIFEST } from "@/generated/pages-manifest";
import { sourceLoaders } from "@/generated/pages-sources";
import { tokenizeTsx, TSX_TOKEN_CLASSES } from "./highlight-tsx";
import type { CodePanelProps } from "@/types/pages/TemplateBrowser-types";

export function CodePanel({
  category,
  variantId,
  copyLabel,
  copiedLabel,
  unavailableLabel,
}: CodePanelProps) {
  const [source, setSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const file = PAGES_MANIFEST[category]?.find((e) => e.id === variantId)?.file;

  // The parent remounts this panel per variant (key={variant id}), so state
  // starts fresh and the effect only has to load — no synchronous resets.
  useEffect(() => {
    let cancelled = false;
    const fail = () => {
      if (!cancelled) setFailed(true);
    };
    const loader = sourceLoaders[category];
    if (!loader) {
      const id = setTimeout(fail, 0);
      return () => {
        cancelled = true;
        clearTimeout(id);
      };
    }
    loader()
      .then((mod) => {
        if (cancelled) return;
        const code = mod.default[variantId];
        if (code) setSource(code);
        else setFailed(true);
      })
      .catch(fail);
    return () => {
      cancelled = true;
    };
  }, [category, variantId]);

  const handleCopy = async () => {
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions, insecure context) — leave the
      // button in its default state so the user can select the text instead.
    }
  };

  if (failed) {
    return <p className="text-muted text-sm italic">{unavailableLabel}</p>;
  }

  if (source === null) {
    return (
      <div className="border-border bg-surface flex items-center justify-center rounded-lg border p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="border-border bg-surface overflow-hidden rounded-lg border">
      <div className="border-border bg-surface-hover/50 flex items-center justify-between gap-3 border-b px-4 py-2">
        <span className="text-muted truncate font-mono text-xs">
          src/views/pages/{file}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          leftIcon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        >
          {copied ? copiedLabel : copyLabel}
        </Button>
      </div>
      <pre className="scroll-fade-y max-h-[70vh] overflow-auto p-4 font-mono text-xs leading-relaxed">
        <code>
          {tokenizeTsx(source).map((token, i) => (
            <span key={i} className={TSX_TOKEN_CLASSES[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
