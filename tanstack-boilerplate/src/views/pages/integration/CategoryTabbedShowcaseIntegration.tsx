"use client";

import {
  IconBug,
  IconChartArea,
  IconChartPie,
  IconClipboardList,
  IconClock,
  IconCloudCode,
  IconFileInvoice,
  IconHeadset,
  IconMail,
  IconPigMoney,
  IconTargetArrow,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithIntegrationMessages } from "@/types/pages/integration/IntegrationMessages-types";

interface ShowcaseTool {
  id: string;
  icon: Icon;
  nameKey: string;
  blurbKey: string;
}

interface ShowcaseCategory {
  id: string;
  labelKey: string;
  tools: ShowcaseTool[];
}

const CATEGORIES: ShowcaseCategory[] = [
  {
    id: "productivity",
    labelKey: "integration4Tab1Label",
    tools: [
      {
        id: "productivity-1",
        icon: IconClipboardList,
        nameKey: "integration4Productivity1Name",
        blurbKey: "integration4Productivity1Blurb",
      },
      {
        id: "productivity-2",
        icon: IconTargetArrow,
        nameKey: "integration4Productivity2Name",
        blurbKey: "integration4Productivity2Blurb",
      },
      {
        id: "productivity-3",
        icon: IconClock,
        nameKey: "integration4Productivity3Name",
        blurbKey: "integration4Productivity3Blurb",
      },
    ],
  },
  {
    id: "communication",
    labelKey: "integration4Tab2Label",
    tools: [
      {
        id: "communication-1",
        icon: IconMail,
        nameKey: "integration4Communication1Name",
        blurbKey: "integration4Communication1Blurb",
      },
      {
        id: "communication-2",
        icon: IconHeadset,
        nameKey: "integration4Communication2Name",
        blurbKey: "integration4Communication2Blurb",
      },
      {
        id: "communication-3",
        icon: IconCloudCode,
        nameKey: "integration4Communication3Name",
        blurbKey: "integration4Communication3Blurb",
      },
    ],
  },
  {
    id: "finance",
    labelKey: "integration4Tab3Label",
    tools: [
      {
        id: "finance-1",
        icon: IconFileInvoice,
        nameKey: "integration4Finance1Name",
        blurbKey: "integration4Finance1Blurb",
      },
      {
        id: "finance-2",
        icon: IconPigMoney,
        nameKey: "integration4Finance2Name",
        blurbKey: "integration4Finance2Blurb",
      },
      {
        id: "finance-3",
        icon: IconChartPie,
        nameKey: "integration4Finance3Name",
        blurbKey: "integration4Finance3Blurb",
      },
    ],
  },
  {
    id: "developer",
    labelKey: "integration4Tab4Label",
    tools: [
      {
        id: "developer-1",
        icon: IconBug,
        nameKey: "integration4Developer1Name",
        blurbKey: "integration4Developer1Blurb",
      },
      {
        id: "developer-2",
        icon: IconChartArea,
        nameKey: "integration4Developer2Name",
        blurbKey: "integration4Developer2Blurb",
      },
      {
        id: "developer-3",
        icon: IconCloudCode,
        nameKey: "integration4Developer3Name",
        blurbKey: "integration4Developer3Blurb",
      },
    ],
  },
];

export function CategoryTabbedShowcaseIntegration() {
  const t = useMessages("pages") as unknown as PagesWithIntegrationMessages;
  const ig = t.integration;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {ig.integration4Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {ig.integration4Heading}
          </h2>
          <p className="text-muted leading-relaxed">{ig.integration4Intro}</p>
        </div>

        <Tabs defaultValue={CATEGORIES[0].id} className="mt-10">
          <div className="flex justify-center">
            <TabsList>
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {ig[cat.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {cat.tools.map((tool) => (
                  <Card key={tool.id} variant="default">
                    <div className="flex flex-col gap-3 p-5">
                      <span className="border-border bg-surface flex size-10 shrink-0 items-center justify-center rounded-lg border">
                        <tool.icon
                          size={20}
                          aria-hidden="true"
                          className="text-fg"
                        />
                      </span>
                      <div>
                        <p className="text-fg text-sm font-semibold">
                          {ig[tool.nameKey]}
                        </p>
                        <p className="text-muted mt-1 text-xs leading-relaxed">
                          {ig[tool.blurbKey]}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
