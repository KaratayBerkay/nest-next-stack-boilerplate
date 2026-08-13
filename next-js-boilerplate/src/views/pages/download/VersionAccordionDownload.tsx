"use client";

import { IconChevronDown, IconDownload } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDownloadMessages } from "@/types/pages/download/DownloadMessages-types";

const LINK_URL = "#" as const;

interface VersionPackage {
  id: string;
  platformKey: string;
  fileKey: string;
  sizeKey: string;
}

interface VersionInfo {
  id: string;
  versionKey: string;
  dateKey: string;
  packages: VersionPackage[];
}

const VERSIONS: VersionInfo[] = [
  {
    id: "v6-1-0",
    versionKey: "download17V610Version",
    dateKey: "download17V610Date",
    packages: [
      {
        id: "win",
        platformKey: "download17Windows",
        fileKey: "download17V610WinFile",
        sizeKey: "download17V610WinSize",
      },
      {
        id: "mac",
        platformKey: "download17Mac",
        fileKey: "download17V610MacFile",
        sizeKey: "download17V610MacSize",
      },
      {
        id: "linux",
        platformKey: "download17Linux",
        fileKey: "download17V610LinuxFile",
        sizeKey: "download17V610LinuxSize",
      },
    ],
  },
  {
    id: "v6-0-3",
    versionKey: "download17V603Version",
    dateKey: "download17V603Date",
    packages: [
      {
        id: "win",
        platformKey: "download17Windows",
        fileKey: "download17V603WinFile",
        sizeKey: "download17V603WinSize",
      },
      {
        id: "mac",
        platformKey: "download17Mac",
        fileKey: "download17V603MacFile",
        sizeKey: "download17V603MacSize",
      },
      {
        id: "linux",
        platformKey: "download17Linux",
        fileKey: "download17V603LinuxFile",
        sizeKey: "download17V603LinuxSize",
      },
    ],
  },
  {
    id: "v6-0-2",
    versionKey: "download17V602Version",
    dateKey: "download17V602Date",
    packages: [
      {
        id: "win",
        platformKey: "download17Windows",
        fileKey: "download17V602WinFile",
        sizeKey: "download17V602WinSize",
      },
      {
        id: "mac",
        platformKey: "download17Mac",
        fileKey: "download17V602MacFile",
        sizeKey: "download17V602MacSize",
      },
      {
        id: "linux",
        platformKey: "download17Linux",
        fileKey: "download17V602LinuxFile",
        sizeKey: "download17V602LinuxSize",
      },
    ],
  },
];

export function VersionAccordionDownload() {
  const t = useMessages("pages") as unknown as PagesWithDownloadMessages;
  const d = t.download;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-5xl">
            {d.download17Title}
          </h2>
          <p className="text-muted max-w-2xl lg:text-lg">
            {d.download17Description}
          </p>
        </div>
        <div className="border-border bg-surface mt-12 overflow-hidden rounded-2xl border shadow-xs">
          <Accordion type="single" collapsible defaultValue="v6-1-0">
            {VERSIONS.map((version) => (
              <AccordionItem key={version.id} value={version.id}>
                <AccordionTrigger className="group gap-4 px-5">
                  <span className="text-fg text-sm font-semibold">
                    {d[version.versionKey]}
                  </span>
                  <span className="flex items-center gap-3">
                    <Badge variant="secondary" pill size="sm">
                      {d[version.dateKey]}
                    </Badge>
                    <IconChevronDown
                      size={18}
                      className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    />
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted hidden gap-4 pb-2 text-xs font-semibold tracking-wide uppercase sm:flex">
                    <span className="w-24">{d.download17PlatformHeader}</span>
                    <span className="flex-1">{d.download17FileHeader}</span>
                    <span className="w-16 text-right">
                      {d.download17SizeHeader}
                    </span>
                    <span className="w-8" />
                  </div>
                  {version.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="border-border flex items-center gap-4 border-t py-2.5"
                    >
                      <span className="text-fg w-24 text-sm font-medium">
                        {d[pkg.platformKey]}
                      </span>
                      <span className="text-fg flex-1 truncate font-mono text-xs">
                        {d[pkg.fileKey]}
                      </span>
                      <span className="text-muted w-16 shrink-0 text-right text-xs">
                        {d[pkg.sizeKey]}
                      </span>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={d.download17DownloadLabel}
                      >
                        <a href={LINK_URL}>
                          <IconDownload size={16} />
                        </a>
                      </Button>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
