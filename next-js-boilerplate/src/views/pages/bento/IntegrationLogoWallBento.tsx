"use client";

import {
  IconArrowRight,
  IconBrandFigma,
  IconBrandGithub,
  IconBrandNotion,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandZoom,
  IconPlug,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

const LINK_URL = "https://example.com" as const;

interface LogoTile {
  id: string;
  icon: Icon;
  nameKey: string;
}

const LOGO_TILES: LogoTile[] = [
  { id: "logo-1", icon: IconBrandSlack, nameKey: "bento7Logo1Name" },
  { id: "logo-2", icon: IconBrandGithub, nameKey: "bento7Logo2Name" },
  { id: "logo-3", icon: IconBrandNotion, nameKey: "bento7Logo3Name" },
  { id: "logo-4", icon: IconBrandFigma, nameKey: "bento7Logo4Name" },
  { id: "logo-5", icon: IconBrandZoom, nameKey: "bento7Logo5Name" },
  { id: "logo-6", icon: IconBrandStripe, nameKey: "bento7Logo6Name" },
];

export function IntegrationLogoWallBento() {
  const t = useMessages("pages") as unknown as PagesWithBentoMessages;
  const b = t.bento;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {b.bento7Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {b.bento7Heading}
          </h2>
          <p className="text-muted leading-relaxed">{b.bento7Intro}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Card
            variant="default"
            className="col-span-2 sm:col-span-3 lg:col-span-2 lg:row-span-2"
          >
            <div className="flex h-full flex-col justify-between gap-6 p-6 @sm:p-8">
              <span className="border-border bg-surface flex size-12 shrink-0 items-center justify-center rounded-xl border">
                <IconPlug size={22} aria-hidden="true" className="text-brand" />
              </span>
              <div className="flex flex-col gap-3">
                <h3 className="text-fg text-2xl font-semibold tracking-tight">
                  {b.bento7HighlightTitle}
                </h3>
                <p className="text-muted leading-relaxed">
                  {b.bento7HighlightBody}
                </p>
              </div>
              <a
                href={LINK_URL}
                className="text-fg group inline-flex w-fit items-center gap-1.5 text-sm font-medium"
              >
                {b.bento7ViewAll}
                <IconArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
            </div>
          </Card>

          {LOGO_TILES.map((logo) => (
            <Card key={logo.id} variant="default">
              <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center @sm:p-6">
                <logo.icon size={28} aria-hidden="true" className="text-fg" />
                <p className="text-muted text-xs font-medium">
                  {b[logo.nameKey]}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
