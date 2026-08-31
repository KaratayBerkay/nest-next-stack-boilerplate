"use client";

import Image from "next/image";
import { IconCheck, IconCode, IconPencil, IconRocket, IconSearch } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface OfferingTab {
  id: string;
  icon: Icon;
  labelKey: string;
  titleKey: string;
  bodyKey: string;
  point1Key: string;
  point2Key: string;
  imageAltKey: string;
  seed: string;
}

const TABS: OfferingTab[] = [
  {
    id: "discover",
    icon: IconSearch,
    labelKey: "service3Tab1Label",
    titleKey: "service3Tab1Title",
    bodyKey: "service3Tab1Body",
    point1Key: "service3Tab1Point1",
    point2Key: "service3Tab1Point2",
    imageAltKey: "service3Tab1ImageAlt",
    seed: "service3-discover",
  },
  {
    id: "design",
    icon: IconPencil,
    labelKey: "service3Tab2Label",
    titleKey: "service3Tab2Title",
    bodyKey: "service3Tab2Body",
    point1Key: "service3Tab2Point1",
    point2Key: "service3Tab2Point2",
    imageAltKey: "service3Tab2ImageAlt",
    seed: "service3-design",
  },
  {
    id: "build",
    icon: IconCode,
    labelKey: "service3Tab3Label",
    titleKey: "service3Tab3Title",
    bodyKey: "service3Tab3Body",
    point1Key: "service3Tab3Point1",
    point2Key: "service3Tab3Point2",
    imageAltKey: "service3Tab3ImageAlt",
    seed: "service3-build",
  },
  {
    id: "launch",
    icon: IconRocket,
    labelKey: "service3Tab4Label",
    titleKey: "service3Tab4Title",
    bodyKey: "service3Tab4Body",
    point1Key: "service3Tab4Point1",
    point2Key: "service3Tab4Point2",
    imageAltKey: "service3Tab4ImageAlt",
    seed: "service3-launch",
  },
];

export function TabbedOfferingsService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" size="sm" className="w-fit">
            {s.service3Eyebrow}
          </Badge>
          <h2 className="text-fg max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.service3Heading}
          </h2>
          <p className="text-muted max-w-xl">{s.service3Intro}</p>
        </div>

        <div className="mt-10">
          <Tabs defaultValue={TABS[0].id}>
            <div className="flex justify-center">
              <TabsList className="flex-wrap">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    <tab.icon size={15} className="mr-1.5" aria-hidden="true" />
                    {s[tab.labelKey]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {TABS.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className="border-border bg-surface overflow-hidden rounded-lg border">
                    <Image
                      src={placeholderImage(tab.seed, "4x3")}
                      alt={s[tab.imageAltKey]}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-4">
                    <h3 className="text-fg text-2xl font-semibold tracking-tight">
                      {s[tab.titleKey]}
                    </h3>
                    <p className="text-muted leading-relaxed">{s[tab.bodyKey]}</p>
                    <ul className="flex flex-col gap-2.5">
                      {[tab.point1Key, tab.point2Key].map((pointKey) => (
                        <li key={pointKey} className="flex items-center gap-2.5">
                          <span className="bg-brand/10 text-brand flex size-5 shrink-0 items-center justify-center rounded-full">
                            <IconCheck size={12} aria-hidden="true" />
                          </span>
                          <span className="text-fg text-sm">{s[pointKey]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
