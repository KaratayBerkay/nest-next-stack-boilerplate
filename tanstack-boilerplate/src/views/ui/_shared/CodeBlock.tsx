"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/button/icon-button";
import type { CodeBlockProps } from "@/types/views/ui/CodeBlock-types";

export function CodeBlock({ code, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("group relative", className)}>
      <IconButton
        icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        label="Copy code"
        className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
      />
      <pre className="bg-surface border-border overflow-x-auto rounded-lg border p-4 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
