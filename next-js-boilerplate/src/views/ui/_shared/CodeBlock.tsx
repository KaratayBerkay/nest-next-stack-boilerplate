"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("group relative", className)}>
      <button
        type="button"
        onClick={handleCopy}
        className="text-muted hover:text-fg absolute top-2 right-2 z-10 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </button>
      <pre className="bg-surface border-border overflow-x-auto rounded-lg border p-4 font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
