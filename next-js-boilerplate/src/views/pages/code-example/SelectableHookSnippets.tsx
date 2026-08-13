"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Button, IconButton } from "@/components/ui/button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCodeExampleMessages } from "@/types/pages/code-example/CodeExampleMessages-types";

interface CodeExample6Snippet {
  id: string;
  nameKey: string;
  benefitKey: string;
  filename: string;
  code: string;
}

const CODE_EXAMPLE_6_SNIPPETS: CodeExample6Snippet[] = [
  {
    id: "debounce",
    nameKey: "codeExample6Card1Name",
    benefitKey: "codeExample6Card1Benefit",
    filename: "useDebounce.ts",
    code: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    id: "local-storage",
    nameKey: "codeExample6Card2Name",
    benefitKey: "codeExample6Card2Benefit",
    filename: "useLocalStorage.ts",
    code: `import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setStored(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    [key],
  );

  return [stored, setValue] as const;
}`,
  },
  {
    id: "fetch",
    nameKey: "codeExample6Card3Name",
    benefitKey: "codeExample6Card3Benefit",
    filename: "useFetch.ts",
    code: `import { useEffect, useState } from "react";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading };
}`,
  },
];

function handleCopy(
  code: string,
  setCopied: Dispatch<SetStateAction<boolean>>,
) {
  navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

export function SelectableHookSnippets() {
  const m = useMessages("pages") as unknown as PagesWithCodeExampleMessages;
  const co = m.codeExample;
  const [activeId, setActiveId] = useState(CODE_EXAMPLE_6_SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);
  const activeSnippet =
    CODE_EXAMPLE_6_SNIPPETS.find((snippet) => snippet.id === activeId) ??
    CODE_EXAMPLE_6_SNIPPETS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {co["codeExample6Title"]}
          </h2>
          <p className="text-muted text-lg">{co["codeExample6Description"]}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {CODE_EXAMPLE_6_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              onClick={() => setActiveId(snippet.id)}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-5 text-left transition-colors",
                activeId === snippet.id
                  ? "border-brand bg-surface-hover"
                  : "border-border bg-surface hover:bg-surface-hover",
              )}
            >
              <span className="text-base font-medium">
                {co[snippet.nameKey]}
              </span>
              <span className="text-muted text-sm">
                {co[snippet.benefitKey]}
              </span>
              <span className="text-muted font-mono text-xs">
                {snippet.filename}
              </span>
            </button>
          ))}
        </div>
        <div className="border-border bg-surface overflow-hidden rounded-2xl border">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <span className="text-muted font-mono text-xs">
              {activeSnippet.filename}
            </span>
            <IconButton
              icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              variant="ghost"
              size="icon-xs"
              label={
                copied
                  ? co["codeExample6CopiedLabel"]
                  : co["codeExample6CopyLabel"]
              }
              onClick={() => handleCopy(activeSnippet.code, setCopied)}
            />
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
            <code>{activeSnippet.code}</code>
          </pre>
        </div>
        <Button variant="outline" className="w-full">
          {co["codeExample6Cta"]}
        </Button>
      </div>
    </section>
  );
}
