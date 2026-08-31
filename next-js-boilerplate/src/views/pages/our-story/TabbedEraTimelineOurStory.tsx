"use client";

import Image from "next/image";
import {
  IconGlobe,
  IconRocket,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithOurStoryMessages } from "@/types/pages/our-story/OurStoryMessages-types";

interface Era {
  id: string;
  icon: typeof IconRocket;
  tabKey: string;
  badgeKey: string;
  headingKey: string;
  bodyKey: string;
  imageAltKey: string;
  milestone1Key: string;
  milestone2Key: string;
  seed: string;
}

const ERAS: Era[] = [
  {
    id: "founding",
    icon: IconRocket,
    tabKey: "ourStory1Era1Tab",
    badgeKey: "ourStory1Era1Badge",
    headingKey: "ourStory1Era1Heading",
    bodyKey: "ourStory1Era1Body",
    imageAltKey: "ourStory1Era1ImageAlt",
    milestone1Key: "ourStory1Era1Milestone1",
    milestone2Key: "ourStory1Era1Milestone2",
    seed: "our-story-1-founding",
  },
  {
    id: "growth",
    icon: IconTrendingUp,
    tabKey: "ourStory1Era2Tab",
    badgeKey: "ourStory1Era2Badge",
    headingKey: "ourStory1Era2Heading",
    bodyKey: "ourStory1Era2Body",
    imageAltKey: "ourStory1Era2ImageAlt",
    milestone1Key: "ourStory1Era2Milestone1",
    milestone2Key: "ourStory1Era2Milestone2",
    seed: "our-story-1-growth",
  },
  {
    id: "expansion",
    icon: IconGlobe,
    tabKey: "ourStory1Era3Tab",
    badgeKey: "ourStory1Era3Badge",
    headingKey: "ourStory1Era3Heading",
    bodyKey: "ourStory1Era3Body",
    imageAltKey: "ourStory1Era3ImageAlt",
    milestone1Key: "ourStory1Era3Milestone1",
    milestone2Key: "ourStory1Era3Milestone2",
    seed: "our-story-1-expansion",
  },
  {
    id: "today",
    icon: IconSparkles,
    tabKey: "ourStory1Era4Tab",
    badgeKey: "ourStory1Era4Badge",
    headingKey: "ourStory1Era4Heading",
    bodyKey: "ourStory1Era4Body",
    imageAltKey: "ourStory1Era4ImageAlt",
    milestone1Key: "ourStory1Era4Milestone1",
    milestone2Key: "ourStory1Era4Milestone2",
    seed: "our-story-1-today",
  },
];

const IMAGE_SIZES = "(max-width: 768px) 100vw, 50vw";

export function TabbedEraTimelineOurStory() {
  const t = useMessages("pages") as unknown as PagesWithOurStoryMessages;
  const os = t.ourStory;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:gap-14 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {os.ourStory1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {os.ourStory1Intro}
          </Typography>
        </div>

        <Tabs defaultValue={ERAS[0].id}>
          <TabsList className="mx-auto flex-wrap">
            {ERAS.map((era) => (
              <TabsTrigger key={era.id} value={era.id}>
                {os[era.tabKey]}
              </TabsTrigger>
            ))}
          </TabsList>

          {ERAS.map((era) => {
            const Icon = era.icon;
            return (
              <TabsContent key={era.id} value={era.id} className="pt-10">
                <div className="flex flex-col items-center gap-10 md:flex-row md:gap-14">
                  <div className="w-full md:w-1/2">
                    <AspectRatio
                      ratio={4 / 3}
                      className="bg-surface relative rounded-2xl"
                    >
                      <Image
                        src={placeholderImage(era.seed, "4x3")}
                        alt={os[era.imageAltKey]}
                        fill
                        sizes={IMAGE_SIZES}
                        className="object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <div className="flex w-full flex-col gap-4 md:w-1/2">
                    <div className="bg-brand/10 flex h-fit w-fit shrink-0 rounded-xl p-3">
                      <Icon
                        size={24}
                        className="text-brand"
                        aria-hidden="true"
                      />
                    </div>
                    <Badge variant="soft" className="w-fit">
                      {os[era.badgeKey]}
                    </Badge>
                    <Typography
                      variant="h3"
                      className="text-2xl font-medium tracking-tighter md:text-3xl"
                    >
                      {os[era.headingKey]}
                    </Typography>
                    <Typography variant="body" className="text-muted">
                      {os[era.bodyKey]}
                    </Typography>
                    <ul className="border-border flex flex-col gap-2 border-t pt-4">
                      <li className="text-fg flex items-start gap-2 text-sm">
                        <span className="bg-brand mt-1.5 size-1.5 shrink-0 rounded-full" />
                        {os[era.milestone1Key]}
                      </li>
                      <li className="text-fg flex items-start gap-2 text-sm">
                        <span className="bg-brand mt-1.5 size-1.5 shrink-0 rounded-full" />
                        {os[era.milestone2Key]}
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
