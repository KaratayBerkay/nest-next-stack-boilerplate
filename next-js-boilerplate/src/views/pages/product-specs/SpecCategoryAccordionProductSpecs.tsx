"use client";

import Image from "next/image";
import {
  IconBattery4,
  IconChevronDown,
  IconCpu,
  IconRulerMeasure,
  IconScreenShare,
  IconShieldCheck,
  IconWifi,
} from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithProductSpecsMessages } from "@/types/pages/product-specs/ProductSpecsMessages-types";

interface SpecRow {
  labelKey: string;
  valueKey: string;
}

interface SpecCategory {
  id: string;
  titleKey: string;
  icon: typeof IconCpu;
  rows: SpecRow[];
}

const CATEGORIES: SpecCategory[] = [
  {
    id: "performance",
    titleKey: "productSpecs1CatPerformanceTitle",
    icon: IconCpu,
    rows: [
      {
        labelKey: "productSpecs1PerfProcessorLabel",
        valueKey: "productSpecs1PerfProcessorValue",
      },
      {
        labelKey: "productSpecs1PerfMemoryLabel",
        valueKey: "productSpecs1PerfMemoryValue",
      },
      {
        labelKey: "productSpecs1PerfStorageLabel",
        valueKey: "productSpecs1PerfStorageValue",
      },
      {
        labelKey: "productSpecs1PerfGraphicsLabel",
        valueKey: "productSpecs1PerfGraphicsValue",
      },
    ],
  },
  {
    id: "display",
    titleKey: "productSpecs1CatDisplayTitle",
    icon: IconScreenShare,
    rows: [
      {
        labelKey: "productSpecs1DispScreenLabel",
        valueKey: "productSpecs1DispScreenValue",
      },
      {
        labelKey: "productSpecs1DispResolutionLabel",
        valueKey: "productSpecs1DispResolutionValue",
      },
      {
        labelKey: "productSpecs1DispPanelLabel",
        valueKey: "productSpecs1DispPanelValue",
      },
      {
        labelKey: "productSpecs1DispBrightnessLabel",
        valueKey: "productSpecs1DispBrightnessValue",
      },
    ],
  },
  {
    id: "battery",
    titleKey: "productSpecs1CatBatteryTitle",
    icon: IconBattery4,
    rows: [
      {
        labelKey: "productSpecs1BattCapacityLabel",
        valueKey: "productSpecs1BattCapacityValue",
      },
      {
        labelKey: "productSpecs1BattLifeLabel",
        valueKey: "productSpecs1BattLifeValue",
      },
      {
        labelKey: "productSpecs1BattChargingLabel",
        valueKey: "productSpecs1BattChargingValue",
      },
      {
        labelKey: "productSpecs1BattFastChargeLabel",
        valueKey: "productSpecs1BattFastChargeValue",
      },
    ],
  },
  {
    id: "connectivity",
    titleKey: "productSpecs1CatConnectivityTitle",
    icon: IconWifi,
    rows: [
      {
        labelKey: "productSpecs1ConnWifiLabel",
        valueKey: "productSpecs1ConnWifiValue",
      },
      {
        labelKey: "productSpecs1ConnBluetoothLabel",
        valueKey: "productSpecs1ConnBluetoothValue",
      },
      {
        labelKey: "productSpecs1ConnPortsLabel",
        valueKey: "productSpecs1ConnPortsValue",
      },
      {
        labelKey: "productSpecs1ConnWebcamLabel",
        valueKey: "productSpecs1ConnWebcamValue",
      },
    ],
  },
  {
    id: "dimensions",
    titleKey: "productSpecs1CatDimensionsTitle",
    icon: IconRulerMeasure,
    rows: [
      {
        labelKey: "productSpecs1DimSizeLabel",
        valueKey: "productSpecs1DimSizeValue",
      },
      {
        labelKey: "productSpecs1DimWeightLabel",
        valueKey: "productSpecs1DimWeightValue",
      },
      {
        labelKey: "productSpecs1DimMaterialLabel",
        valueKey: "productSpecs1DimMaterialValue",
      },
      {
        labelKey: "productSpecs1DimColorsLabel",
        valueKey: "productSpecs1DimColorsValue",
      },
    ],
  },
];

export function SpecCategoryAccordionProductSpecs() {
  const t = useMessages("pages") as unknown as PagesWithProductSpecsMessages;
  const p = t.productSpecs;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-3xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-widest uppercase">
            {p.productSpecs1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {p.productSpecs1Title}
          </h2>
          <p className="text-muted max-w-xl text-base leading-relaxed">
            {p.productSpecs1Description}
          </p>
        </div>

        <div className="border-border bg-surface mb-8 flex items-center gap-4 rounded-2xl border p-4 shadow-xs sm:p-5">
          <div className="border-border bg-bg size-16 shrink-0 overflow-hidden rounded-xl border sm:size-20">
            <Image
              src={placeholderImage("product-specs-1-thumb", "1x1")}
              alt={p.productSpecs1ProductImageAlt}
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-fg text-lg font-semibold tracking-tight">
                {p.productSpecs1ProductName}
              </h3>
              <Badge variant="soft" pill size="sm">
                <IconShieldCheck
                  size={12}
                  aria-hidden="true"
                  className="mr-1.5"
                />
                {p.productSpecs1VerifiedBadge}
              </Badge>
            </div>
            <p className="text-muted text-sm">
              {p.productSpecs1ProductTagline}
            </p>
          </div>
        </div>

        <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-xs">
          <Accordion type="single" collapsible defaultValue="performance">
            {CATEGORIES.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="group gap-4">
                  <span className="flex items-center gap-3">
                    <category.icon
                      size={18}
                      className="text-brand shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-fg text-sm font-semibold">
                      {p[category.titleKey]}
                    </span>
                  </span>
                  <IconChevronDown
                    size={16}
                    aria-hidden="true"
                    className="text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableBody>
                      {category.rows.map((row) => (
                        <TableRow key={row.labelKey}>
                          <TableCell className="w-1/2 font-medium sm:w-2/5">
                            {p[row.labelKey]}
                          </TableCell>
                          <TableCell className="text-fg">
                            {p[row.valueKey]}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
