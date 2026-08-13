"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconBrandApple,
  IconBrandUbuntu,
  IconBrandWindows,
  IconCheck,
  IconCopy,
  IconTerminal2,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

interface OsSnippet {
  value: string;
  icon: Icon;
  labelKey: string;
  commandKey: string;
}

const OS_SNIPPETS: OsSnippet[] = [
  {
    value: "windows",
    icon: IconBrandWindows,
    labelKey: "download5WindowsLabel",
    commandKey: "download5WindowsCommand",
  },
  {
    value: "macos",
    icon: IconBrandApple,
    labelKey: "download5MacLabel",
    commandKey: "download5MacCommand",
  },
  {
    value: "linux",
    icon: IconBrandUbuntu,
    labelKey: "download5LinuxLabel",
    commandKey: "download5LinuxCommand",
  },
];

function handleCopy(
  command: string,
  setCopiedValue: Dispatch<SetStateAction<string | null>>,
) {
  navigator.clipboard.writeText(command);
  setCopiedValue(command);
  setTimeout(() => setCopiedValue(null), 2000);
}

export function MultiOsSnippetsDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download5Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download5Description}
          </p>
        </div>
        <div className="mt-12">
          <Tabs
            defaultValue={OS_SNIPPETS[0].value}
            className="mx-auto w-full max-w-2xl"
          >
            <TabsList className="mx-auto grid h-10 w-full max-w-sm grid-cols-3">
              {OS_SNIPPETS.map((snippet) => {
                const Icon = snippet.icon;
                return (
                  <TabsTrigger key={snippet.value} value={snippet.value}>
                    <span className="flex items-center gap-2">
                      <Icon size={16} aria-hidden="true" />
                      {d[snippet.labelKey]}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {OS_SNIPPETS.map((snippet) => (
              <TabsContent key={snippet.value} value={snippet.value}>
                <div className="border-border bg-surface-hover/50 mt-6 overflow-hidden rounded-2xl border">
                  <div className="border-border bg-surface flex items-center justify-between gap-3 border-b px-4 py-3">
                    <span className="text-muted flex items-center gap-2 font-mono text-sm">
                      <IconTerminal2 size={16} aria-hidden="true" />
                      {d[snippet.labelKey]}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={d.download5CopyAria}
                      onClick={() =>
                        handleCopy(d[snippet.commandKey], setCopiedValue)
                      }
                      leftIcon={
                        copiedValue === d[snippet.commandKey] ? (
                          <IconCheck size={14} aria-hidden="true" />
                        ) : (
                          <IconCopy size={14} aria-hidden="true" />
                        )
                      }
                    >
                      {copiedValue === d[snippet.commandKey]
                        ? d.download5Copied
                        : d.download5Copy}
                    </Button>
                  </div>
                  <pre className="text-fg overflow-x-auto p-5 font-mono text-sm leading-relaxed">
                    <code>{d[snippet.commandKey]}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
