"use client";

import { useEffect, useState } from "react";
import {
  IconCircleCheck,
  IconDownload,
  IconFileTypePdf,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Quote } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithResourceMessages } from "@/types/pages/resource/ResourceMessages-types";

interface FactRow {
  id: string;
  labelKey: string;
  valueKey: string;
}

const FACTS: FactRow[] = [
  {
    id: "format",
    labelKey: "resource1FactFormatLabel",
    valueKey: "resource1FactFormatValue",
  },
  {
    id: "pages",
    labelKey: "resource1FactPagesLabel",
    valueKey: "resource1FactPagesValue",
  },
  {
    id: "language",
    labelKey: "resource1FactLanguageLabel",
    valueKey: "resource1FactLanguageValue",
  },
  {
    id: "updated",
    labelKey: "resource1FactUpdatedLabel",
    valueKey: "resource1FactUpdatedValue",
  },
];

interface TakeawayRow {
  id: string;
  key: string;
}

const TAKEAWAYS: TakeawayRow[] = [
  { id: "takeaway-1", key: "resource1Takeaway1" },
  { id: "takeaway-2", key: "resource1Takeaway2" },
  { id: "takeaway-3", key: "resource1Takeaway3" },
];

export function ArticleFactsSidebarResource() {
  const t = useMessages("pages") as unknown as PagesWithResourceMessages;
  const r = t.resource;
  // null = idle, 0-99 = downloading, 100 = done. A chained setTimeout ticks the
  // bar forward; the setState call lives inside the timeout callback, never
  // synchronously at the top of the effect.
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (progress === null || progress >= 100) return undefined;
    const timer = setTimeout(() => {
      setProgress((prev) => (prev === null ? null : Math.min(100, prev + 20)));
    }, 150);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
          <article className="flex min-w-0 flex-col gap-6">
            <Badge variant="outline" className="w-fit">
              {r.resource1Eyebrow}
            </Badge>
            <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {r.resource1Title}
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              {r.resource1Lead}
            </p>

            <div className="flex flex-col gap-4">
              <h2 className="text-fg text-xl font-semibold">
                {r.resource1Heading1}
              </h2>
              <p className="text-muted leading-relaxed">{r.resource1Body1}</p>
              <Quote className="text-fg">
                <p className="text-lg font-medium">{r.resource1QuoteText}</p>
                <footer className="text-muted mt-2 text-sm not-italic">
                  {r.resource1QuoteAttribution}
                </footer>
              </Quote>
              <h2 className="text-fg text-xl font-semibold">
                {r.resource1Heading2}
              </h2>
              <p className="text-muted leading-relaxed">{r.resource1Body2}</p>
            </div>

            <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
              <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
                {r.resource1TakeawaysHeading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {TAKEAWAYS.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <IconCircleCheck
                      size={16}
                      className="text-brand mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-fg text-sm">{r[item.key]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside>
            <div className="lg:sticky lg:top-24">
              <Card variant="default">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="border-border bg-surface-hover/50 text-brand flex size-12 shrink-0 items-center justify-center rounded-xl border"
                    >
                      <IconFileTypePdf size={24} />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <CardTitle className="truncate">
                        {r.resource1FileName}
                      </CardTitle>
                      <CardDescription>{r.resource1FileMeta}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {FACTS.map((fact) => (
                      <div key={fact.id} className="flex flex-col gap-0.5">
                        <span className="text-muted text-xs">
                          {r[fact.labelKey]}
                        </span>
                        <span className="text-fg text-sm font-medium">
                          {r[fact.valueKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  {progress === null && (
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full justify-center"
                      leftIcon={<IconDownload size={16} aria-hidden="true" />}
                      onClick={() => setProgress(0)}
                    >
                      {r.resource1DownloadCta}
                    </Button>
                  )}
                  {progress !== null && progress < 100 && (
                    <div className="flex w-full flex-col gap-2">
                      <Progress value={progress} showValueLabel />
                      <span className="text-muted text-xs">
                        {r.resource1Downloading}
                      </span>
                    </div>
                  )}
                  {progress === 100 && (
                    <div className="flex w-full flex-col items-center gap-2 text-center">
                      <span className="text-success flex items-center gap-1.5 text-sm font-medium">
                        <IconCircleCheck size={16} aria-hidden="true" />
                        {r.resource1DownloadDone}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setProgress(null)}
                      >
                        {r.resource1DownloadAgain}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
