"use client";

import Image from "next/image";
import {
  IconBolt,
  IconCamera,
  IconCpu,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductSpecsMessages } from "@/types/pages/product-specs/ProductSpecsMessages-types";

interface SpecRow {
  labelKey: string;
  valueKey: string;
}

interface SpecTab {
  id: string;
  labelKey: string;
  icon: typeof IconCpu;
  rows: SpecRow[];
}

const TABS: SpecTab[] = [
  {
    id: "display",
    labelKey: "productSpecs2TabDisplayLabel",
    icon: IconDeviceMobile,
    rows: [
      { labelKey: "productSpecs2DispScreenLabel", valueKey: "productSpecs2DispScreenValue" },
      { labelKey: "productSpecs2DispResolutionLabel", valueKey: "productSpecs2DispResolutionValue" },
      { labelKey: "productSpecs2DispProtectionLabel", valueKey: "productSpecs2DispProtectionValue" },
      { labelKey: "productSpecs2DispBodyLabel", valueKey: "productSpecs2DispBodyValue" },
    ],
  },
  {
    id: "camera",
    labelKey: "productSpecs2TabCameraLabel",
    icon: IconCamera,
    rows: [
      { labelKey: "productSpecs2CamRearLabel", valueKey: "productSpecs2CamRearValue" },
      { labelKey: "productSpecs2CamFrontLabel", valueKey: "productSpecs2CamFrontValue" },
      { labelKey: "productSpecs2CamZoomLabel", valueKey: "productSpecs2CamZoomValue" },
      { labelKey: "productSpecs2CamVideoLabel", valueKey: "productSpecs2CamVideoValue" },
    ],
  },
  {
    id: "performance",
    labelKey: "productSpecs2TabPerformanceLabel",
    icon: IconCpu,
    rows: [
      { labelKey: "productSpecs2PerfChipsetLabel", valueKey: "productSpecs2PerfChipsetValue" },
      { labelKey: "productSpecs2PerfRamLabel", valueKey: "productSpecs2PerfRamValue" },
      { labelKey: "productSpecs2PerfStorageLabel", valueKey: "productSpecs2PerfStorageValue" },
      { labelKey: "productSpecs2PerfNeuralLabel", valueKey: "productSpecs2PerfNeuralValue" },
    ],
  },
  {
    id: "battery",
    labelKey: "productSpecs2TabBatteryLabel",
    icon: IconBolt,
    rows: [
      { labelKey: "productSpecs2BattCapacityLabel", valueKey: "productSpecs2BattCapacityValue" },
      { labelKey: "productSpecs2BattChargingLabel", valueKey: "productSpecs2BattChargingValue" },
      { labelKey: "productSpecs2BattNetworkLabel", valueKey: "productSpecs2BattNetworkValue" },
      { labelKey: "productSpecs2BattPortLabel", valueKey: "productSpecs2BattPortValue" },
    ],
  },
];

export function TabbedSpecGridProductSpecs() {
  const t = useMessages("pages") as unknown as PagesWithProductSpecsMessages;
  const p = t.productSpecs;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {p.productSpecs2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {p.productSpecs2Title}
          </h2>
          <p className="text-muted max-w-xl text-base leading-relaxed">
            {p.productSpecs2Description}
          </p>
        </div>

        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xs">
          <div className="border-border flex items-center gap-4 border-b p-5 sm:p-6">
            <div className="border-border bg-bg size-16 shrink-0 overflow-hidden rounded-xl border sm:size-20">
              <Image
                src={placeholderImage("product-specs-2-thumb", "1x1")}
                alt={p.productSpecs2ProductImageAlt}
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="text-fg text-lg font-semibold tracking-tight">
                {p.productSpecs2ProductName}
              </h3>
              <p className="text-muted text-sm">
                {p.productSpecs2ProductTagline}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <Tabs defaultValue="display">
              <TabsList className="flex w-full flex-wrap sm:w-auto">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                    <tab.icon size={16} aria-hidden="true" />
                    {p[tab.labelKey]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="pt-6">
                  <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {tab.rows.map((row) => (
                      <div
                        key={row.labelKey}
                        className="border-border flex flex-col gap-1 border-b pb-3"
                      >
                        <dt className="text-muted text-xs font-medium tracking-wide uppercase">
                          {p[row.labelKey]}
                        </dt>
                        <dd className="text-fg text-sm font-medium">
                          {p[row.valueKey]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
