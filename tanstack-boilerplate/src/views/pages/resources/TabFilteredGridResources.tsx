"use client";

import { useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Icon } from "@tabler/icons-react";
import {
  IconArrowRight,
  IconArticle,
  IconBroadcast,
  IconCircleCheck,
  IconClockHour4,
  IconMailFast,
  IconPlayerPlayFilled,
  IconSearch,
  IconTemplate,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithResourcesMessages } from "@/types/pages/resources/ResourcesMessages-types";

const LINK_URL = "#" as const;

type ResourceType = "guide" | "video" | "template" | "webinar";
type FilterValue = "all" | ResourceType;

interface TypeTab {
  value: FilterValue;
  labelKey: string;
}

const TYPE_TABS: TypeTab[] = [
  { value: "all", labelKey: "resources1TypeAllLabel" },
  { value: "guide", labelKey: "resources1TypeGuideLabel" },
  { value: "video", labelKey: "resources1TypeVideoLabel" },
  { value: "template", labelKey: "resources1TypeTemplateLabel" },
  { value: "webinar", labelKey: "resources1TypeWebinarLabel" },
];

const TYPE_ICON: Record<ResourceType, Icon> = {
  guide: IconArticle,
  video: IconPlayerPlayFilled,
  template: IconTemplate,
  webinar: IconBroadcast,
};

const TYPE_LABEL_KEY: Record<ResourceType, string> = {
  guide: "resources1TypeGuideLabel",
  video: "resources1TypeVideoLabel",
  template: "resources1TypeTemplateLabel",
  webinar: "resources1TypeWebinarLabel",
};

interface ResourceCardItem {
  id: string;
  type: ResourceType;
  titleKey: string;
  descriptionKey: string;
  metaKey: string;
  readAriaKey: string;
}

const RESOURCES: ResourceCardItem[] = [
  {
    id: "onboarding-checklist",
    type: "guide",
    titleKey: "resources1Item1Title",
    descriptionKey: "resources1Item1Description",
    metaKey: "resources1Item1Meta",
    readAriaKey: "resources1Item1ReadAria",
  },
  {
    id: "design-docs",
    type: "guide",
    titleKey: "resources1Item2Title",
    descriptionKey: "resources1Item2Description",
    metaKey: "resources1Item2Meta",
    readAriaKey: "resources1Item2ReadAria",
  },
  {
    id: "product-tour",
    type: "video",
    titleKey: "resources1Item3Title",
    descriptionKey: "resources1Item3Description",
    metaKey: "resources1Item3Meta",
    readAriaKey: "resources1Item3ReadAria",
  },
  {
    id: "debugging-live",
    type: "video",
    titleKey: "resources1Item4Title",
    descriptionKey: "resources1Item4Description",
    metaKey: "resources1Item4Meta",
    readAriaKey: "resources1Item4ReadAria",
  },
  {
    id: "roadmap-template",
    type: "template",
    titleKey: "resources1Item5Title",
    descriptionKey: "resources1Item5Description",
    metaKey: "resources1Item5Meta",
    readAriaKey: "resources1Item5ReadAria",
  },
  {
    id: "postmortem-template",
    type: "template",
    titleKey: "resources1Item6Title",
    descriptionKey: "resources1Item6Description",
    metaKey: "resources1Item6Meta",
    readAriaKey: "resources1Item6ReadAria",
  },
  {
    id: "scaling-support",
    type: "webinar",
    titleKey: "resources1Item7Title",
    descriptionKey: "resources1Item7Description",
    metaKey: "resources1Item7Meta",
    readAriaKey: "resources1Item7ReadAria",
  },
  {
    id: "roadmap-qa",
    type: "webinar",
    titleKey: "resources1Item8Title",
    descriptionKey: "resources1Item8Description",
    metaKey: "resources1Item8Meta",
    readAriaKey: "resources1Item8ReadAria",
  },
];

function filterResources(
  items: readonly ResourceCardItem[],
  type: FilterValue,
  query: string,
  r: Record<string, string>,
): ResourceCardItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    if (!q) return true;
    const title = r[item.titleKey].toLowerCase();
    const description = r[item.descriptionKey].toLowerCase();
    return title.includes(q) || description.includes(q);
  });
}

function handleSubscribe(
  event: FormEvent<HTMLFormElement>,
  email: string,
  setSubscribed: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  if (!email.trim()) return;
  setSubscribed(true);
}

export function TabFilteredGridResources() {
  const t = useMessages("pages") as unknown as PagesWithResourcesMessages;
  const r = t.resources;
  const [type, setType] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filtered = useMemo(
    () => filterResources(RESOURCES, type, query, r),
    [type, query, r],
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Badge variant="soft" className="w-fit">
            {r.resources1Eyebrow}
          </Badge>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {r.resources1Heading}
          </h2>
          <p className="text-muted leading-relaxed">
            {r.resources1Description}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={type} onValueChange={(value) => setType(value as FilterValue)}>
            <TabsList>
              {TYPE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {r[tab.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={r.resources1SearchPlaceholder}
            aria-label={r.resources1SearchAria}
            leftIcon={<IconSearch size={16} />}
            className="lg:w-64"
          />
        </div>

        <p className="text-muted mt-4 text-xs">
          {r.resources1ResultsCount.replace("{count}", String(filtered.length))}
        </p>

        {filtered.length === 0 ? (
          <Empty
            icon={<IconSearch size={28} aria-hidden="true" />}
            title={r.resources1NoResultsTitle}
            description={r.resources1NoResultsDescription}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setType("all");
                }}
              >
                {r.resources1ClearFiltersCta}
              </Button>
            }
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const TypeIcon = TYPE_ICON[item.type];
              return (
                <Card key={item.id} variant="default" className="overflow-hidden">
                  <div className="relative">
                    <AspectRatio ratio={4 / 3}>
                      <Image
                        src={placeholderImage(item.id, "4x3")}
                        alt={r[item.titleKey]}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </AspectRatio>
                    <span className="bg-bg/90 text-fg absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                      <TypeIcon size={13} aria-hidden="true" />
                      {r[TYPE_LABEL_KEY[item.type]]}
                    </span>
                  </div>
                  <CardHeader>
                    <CardTitle>{r[item.titleKey]}</CardTitle>
                    <CardDescription>{r[item.descriptionKey]}</CardDescription>
                  </CardHeader>
                  <CardFooter className="justify-between">
                    <span className="text-muted flex items-center gap-1.5 text-xs">
                      <IconClockHour4 size={13} aria-hidden="true" />
                      {r[item.metaKey]}
                    </span>
                    <Link
                      href={LINK_URL}
                      aria-label={r[item.readAriaKey]}
                      className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {r.resources1ReadCta}
                      <IconArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <div className="border-border bg-surface mt-14 flex flex-col items-center gap-4 rounded-3xl border p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="border-border bg-bg text-brand flex size-11 shrink-0 items-center justify-center rounded-full border"
            >
              <IconMailFast size={20} />
            </span>
            <div className="flex flex-col">
              <span className="text-fg text-sm font-semibold">
                {r.resources1NewsletterTitle}
              </span>
              <span className="text-muted text-xs">
                {r.resources1NewsletterDescription}
              </span>
            </div>
          </div>
          {subscribed ? (
            <span className="text-success flex items-center gap-1.5 text-sm font-medium">
              <IconCircleCheck size={16} aria-hidden="true" />
              {r.resources1NewsletterSuccess}
            </span>
          ) : (
            <form
              onSubmit={(event) => handleSubscribe(event, email, setSubscribed)}
              className="flex w-full max-w-sm gap-2 sm:w-auto"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={r.resources1NewsletterPlaceholder}
                aria-label={r.resources1NewsletterAria}
              />
              <Button type="submit" variant="primary" className="shrink-0">
                {r.resources1NewsletterCta}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
