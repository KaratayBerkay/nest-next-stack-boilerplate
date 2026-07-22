"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { TabsTriggerVariant } from "@/types/ui/TabsTrigger-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import { UnderlineNavTab } from "@/views/ui/tabs/UnderlineNavTab";
import { PillFiltersTab } from "@/views/ui/tabs/PillFiltersTab";
import { SettingsSectionsTab } from "@/views/ui/tabs/SettingsSections";
import { CodePreviewTab } from "@/views/ui/tabs/CodePreviewTab";
import { DashboardPeriodsTab } from "@/views/ui/tabs/DashboardPeriodsTab";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Underline Nav",
    description: "Tabs with underline variant for navigation.",
    render: () => <UnderlineNavTab />,
  },
  {
    id: "pill-filters",
    title: "Pill Filters",
    description: "Tabs with pill-shaped active state for category filtering.",
    render: () => <PillFiltersTab />,
  },
  {
    id: "settings-sections",
    title: "Settings Sections",
    description:
      "Profile, security, and notifications settings with real form controls.",
    render: () => <SettingsSectionsTab />,
  },
  {
    id: "code-preview",
    title: "Code Preview",
    description: "Toggle between a rendered preview and the source code.",
    render: () => <CodePreviewTab />,
  },
  {
    id: "dashboard-periods",
    title: "Dashboard Periods",
    description: "Day, week, and month KPI tiles with trend indicators.",
    render: () => <DashboardPeriodsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All trigger variants including the global styles.",
    render: () => (
      <VariantGallery
        variants={[
          "default",
          "underline",
          "pills",
          "shiny",
          "glass",
          "neon",
          "gradient",
        ]}
        sizes={[]}
        render={(variant) => (
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1" variant={variant as TabsTriggerVariant}>
                Tab 1
              </TabsTrigger>
              <TabsTrigger value="tab2" variant={variant as TabsTriggerVariant}>
                Tab 2
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p className="text-muted text-xs">Panel content</p>
            </TabsContent>
            <TabsContent value="tab2">
              <p className="text-muted text-xs">Second panel</p>
            </TabsContent>
          </Tabs>
        )}
      />
    ),
  },
];

export default function Page({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Tabs"
      intro="A set of layered content panels shown one at a time."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
