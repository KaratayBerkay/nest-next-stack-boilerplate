"use client";

import Image from "next/image";
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconExternalLink,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithProjectMessages } from "@/types/pages/project/ProjectMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const LIVE_URL = "https://example.com" as const;

interface MetaRow {
  icon: typeof IconBriefcase;
  labelKey: string;
  valueKey: string;
}

const META_ROWS: MetaRow[] = [
  {
    icon: IconBriefcase,
    labelKey: "project1RoleLabel",
    valueKey: "project1RoleValue",
  },
  {
    icon: IconBuildingSkyscraper,
    labelKey: "project1ClientLabel",
    valueKey: "project1ClientValue",
  },
  {
    icon: IconCalendar,
    labelKey: "project1TimelineLabel",
    valueKey: "project1TimelineValue",
  },
];

const STACK_KEYS = [
  "project1Stack1",
  "project1Stack2",
  "project1Stack3",
  "project1Stack4",
  "project1Stack5",
] as const;

const CAPABILITY_KEYS = [
  "project1Capability1",
  "project1Capability2",
  "project1Capability3",
] as const;

interface Credit {
  roleKey: string;
  nameKey: string;
}

const CREDITS: Credit[] = [
  { roleKey: "project1Credit1Role", nameKey: "project1Credit1Name" },
  { roleKey: "project1Credit2Role", nameKey: "project1Credit2Name" },
  { roleKey: "project1Credit3Role", nameKey: "project1Credit3Name" },
];

export function HeroMetaSidebarProject() {
  const t = useMessages("pages") as unknown as PagesWithProjectMessages;
  const p = t.project;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <Badge variant="soft">{p.project1Eyebrow}</Badge>
          <h1 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {p.project1Title}
          </h1>
          <p className="text-muted max-w-2xl text-lg leading-relaxed">
            {p.project1Summary}
          </p>
        </div>

        <div className="border-border bg-surface mt-10 overflow-hidden rounded-2xl border">
          <AspectRatio ratio={2 / 1}>
            <Image
              src={placeholderImage("project-hero-meta", "2x1")}
              alt={p.project1HeroAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </AspectRatio>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-14">
          <div className="flex flex-col gap-10 lg:col-span-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project1OverviewHeading}
              </h2>
              <p className="text-muted leading-relaxed">
                {p.project1OverviewBody}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project1ApproachHeading}
              </h2>
              <p className="text-muted leading-relaxed">
                {p.project1ApproachBody}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-fg text-xl font-semibold">
                {p.project1CapabilitiesHeading}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {CAPABILITY_KEYS.map((key) => (
                  <li
                    key={key}
                    className="border-border bg-surface text-fg rounded-lg border px-4 py-3 text-sm"
                  >
                    {p[key]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-6 lg:sticky lg:top-24">
              <Card variant="default">
                <CardHeader>
                  <CardTitle>{p.project1SidebarHeading}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 text-sm">
                    {META_ROWS.map((row) => (
                      <div
                        key={row.labelKey}
                        className="flex items-start gap-3"
                      >
                        <row.icon
                          size={16}
                          className="text-brand mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="flex flex-col">
                          <span className="text-muted text-xs">
                            {p[row.labelKey]}
                          </span>
                          <span className="text-fg font-medium">
                            {p[row.valueKey]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator label={p.project1StackLabel} />

                  <div className="flex flex-wrap gap-2">
                    {STACK_KEYS.map((key) => (
                      <Badge key={key} variant="secondary">
                        {p[key]}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="primary"
                      className="justify-center"
                    >
                      <a
                        href={LIVE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {p.project1VisitCta}
                        <IconExternalLink
                          size={15}
                          aria-hidden="true"
                          className="ml-1.5"
                        />
                      </a>
                    </Button>
                    <Dialog>
                      <DialogTrigger
                        variant="outline"
                        className="w-full justify-center"
                      >
                        {p.project1CreditsCta}
                      </DialogTrigger>
                      <DialogContent
                        size="md"
                        closeLabel={p.project1CreditsDialogCloseAria}
                      >
                        <DialogHeader>
                          <DialogTitle>
                            {p.project1CreditsDialogTitle}
                          </DialogTitle>
                          <DialogDescription>
                            {p.project1CreditsDialogDescription}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogBody>
                          <ul className="flex flex-col gap-3">
                            {CREDITS.map((credit) => (
                              <li
                                key={credit.roleKey}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted">
                                  {p[credit.roleKey]}
                                </span>
                                <span className="text-fg font-medium">
                                  {p[credit.nameKey]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </DialogBody>
                        <DialogFooter>
                          <DialogClose variant="outline">
                            {p.project1CreditsDialogClose}
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
