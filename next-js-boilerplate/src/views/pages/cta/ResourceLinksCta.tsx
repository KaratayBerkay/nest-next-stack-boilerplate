"use client";

import { IconArrowUpRight, IconBook2, IconFolder } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCtaMessages } from "@/types/pages/cta/CtaMessages-types";

const LINK_URL = "#" as const;

const RESOURCE_LINKS: { icon: Icon; titleKey: string; bodyKey: string }[] = [
  {
    icon: IconBook2,
    titleKey: "cta19Resource1Title",
    bodyKey: "cta19Resource1Body",
  },
  {
    icon: IconFolder,
    titleKey: "cta19Resource2Title",
    bodyKey: "cta19Resource2Body",
  },
];

export function ResourceLinksCta() {
  const m = useMessages("pages") as unknown as PagesWithCtaMessages;
  const co = m.cta;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border bg-surface grid gap-10 rounded-3xl border p-8 shadow-xs lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col items-start gap-5">
            <Badge variant="outline" pill>
              {co.cta19Badge}
            </Badge>
            <Typography
              variant="h2"
              className="max-w-lg text-4xl font-medium tracking-tighter md:text-5xl"
            >
              {co.cta19Title}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted max-w-md">
              {co.cta19Body}
            </Typography>
            <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta19PrimaryButton}</a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={LINK_URL}>{co.cta19SecondaryButton}</a>
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            {RESOURCE_LINKS.map((link) => (
              <a
                key={link.titleKey}
                href={LINK_URL}
                className="border-border group hover:bg-surface-hover flex items-center gap-4 border-b px-2 py-6 transition-colors first:border-t"
              >
                <span className="bg-surface-hover border-border flex size-12 shrink-0 items-center justify-center rounded-2xl border">
                  <link.icon size={22} className="text-brand" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-base font-semibold">
                    {co[link.titleKey]}
                  </span>
                  <span className="text-muted text-sm">{co[link.bodyKey]}</span>
                </span>
                <IconArrowUpRight
                  size={20}
                  className="text-muted ml-auto shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
