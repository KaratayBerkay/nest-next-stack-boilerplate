"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import {
  IconCircleCheck,
  IconDownload,
  IconLock,
  IconUsers,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithResourceMessages } from "@/types/pages/resource/ResourceMessages-types";

const LINK_URL = "#" as const;

interface InsideRow {
  id: string;
  key: string;
}

const INSIDE_ITEMS: InsideRow[] = [
  { id: "inside-1", key: "resource3Inside1" },
  { id: "inside-2", key: "resource3Inside2" },
  { id: "inside-3", key: "resource3Inside3" },
  { id: "inside-4", key: "resource3Inside4" },
];

function handleUnlock(
  event: FormEvent<HTMLFormElement>,
  setUnlocked: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setUnlocked(true);
}

export function BreadcrumbGatedCoverResource() {
  const t = useMessages("pages") as unknown as PagesWithResourceMessages;
  const r = t.resource;
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={LINK_URL}>
                {r.resource3BreadcrumbHome}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={LINK_URL}>
                {r.resource3BreadcrumbCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{r.resource3Title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="border-border bg-surface w-32 shrink-0 overflow-hidden rounded-xl border sm:w-40">
                <AspectRatio ratio={3 / 4}>
                  <Image
                    src={placeholderImage("resource-3-cover", "3x4")}
                    alt={r.resource3CoverAlt}
                    fill
                    sizes="(min-width: 640px) 160px, 128px"
                    className="object-cover"
                  />
                </AspectRatio>
              </div>
              <div className="flex flex-col gap-3">
                <Badge variant="soft" className="w-fit">
                  {r.resource3Badge}
                </Badge>
                <h1 className="text-fg text-2xl font-semibold tracking-tight lg:text-3xl">
                  {r.resource3Title}
                </h1>
                <p className="text-muted leading-relaxed">
                  {r.resource3Description}
                </p>
              </div>
            </div>

            <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
              <h2 className="text-fg text-sm font-semibold tracking-wide uppercase">
                {r.resource3InsideHeading}
              </h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {INSIDE_ITEMS.map((item) => (
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

            <div className="text-muted flex items-center gap-2 text-sm">
              <IconUsers size={16} aria-hidden="true" />
              {r.resource3TrustCaption}
            </div>
          </div>

          <aside>
            <div className="lg:sticky lg:top-24">
              <Card variant="default">
                {unlocked ? (
                  <div className="flex flex-col items-center gap-3 p-4 text-center @sm:p-6">
                    <span className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
                      <IconCircleCheck size={22} aria-hidden="true" />
                    </span>
                    <CardTitle>{r.resource3UnlockedTitle}</CardTitle>
                    <CardDescription>
                      {r.resource3UnlockedBody.replace("{email}", email)}
                    </CardDescription>
                    <Button
                      asChild
                      variant="primary"
                      className="w-full justify-center"
                      leftIcon={<IconDownload size={16} aria-hidden="true" />}
                    >
                      <a href={LINK_URL}>{r.resource3DownloadCta}</a>
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardHeader>
                      <Badge variant="soft" className="w-fit">
                        {r.resource3Badge}
                      </Badge>
                      <CardTitle>{r.resource3GateTitle}</CardTitle>
                      <CardDescription>
                        {r.resource3GateDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={(event) => handleUnlock(event, setUnlocked)}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="resource3-email">
                            {r.resource3EmailLabel}
                          </Label>
                          <Input
                            id="resource3-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={r.resource3EmailPlaceholder}
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full justify-center"
                          leftIcon={<IconLock size={16} aria-hidden="true" />}
                        >
                          {r.resource3SubmitCta}
                        </Button>
                        <p className="text-muted text-center text-xs">
                          {r.resource3FinePrint}
                        </p>
                      </form>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
