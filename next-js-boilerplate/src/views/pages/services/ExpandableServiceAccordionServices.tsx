"use client";

import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

interface ServiceItem {
  id: string;
  nameKey: string;
  summaryKey: string;
  priceKey: string;
  timelineKey: string;
  deliverable1Key: string;
  deliverable2Key: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "brand-identity",
    nameKey: "services3Service1Name",
    summaryKey: "services3Service1Summary",
    priceKey: "services3Service1Price",
    timelineKey: "services3Service1Timeline",
    deliverable1Key: "services3Service1Deliverable1",
    deliverable2Key: "services3Service1Deliverable2",
  },
  {
    id: "web-platform",
    nameKey: "services3Service2Name",
    summaryKey: "services3Service2Summary",
    priceKey: "services3Service2Price",
    timelineKey: "services3Service2Timeline",
    deliverable1Key: "services3Service2Deliverable1",
    deliverable2Key: "services3Service2Deliverable2",
  },
  {
    id: "growth-marketing",
    nameKey: "services3Service3Name",
    summaryKey: "services3Service3Summary",
    priceKey: "services3Service3Price",
    timelineKey: "services3Service3Timeline",
    deliverable1Key: "services3Service3Deliverable1",
    deliverable2Key: "services3Service3Deliverable2",
  },
  {
    id: "managed-support",
    nameKey: "services3Service4Name",
    summaryKey: "services3Service4Summary",
    priceKey: "services3Service4Price",
    timelineKey: "services3Service4Timeline",
    deliverable1Key: "services3Service4Deliverable1",
    deliverable2Key: "services3Service4Deliverable2",
  },
  {
    id: "data-analytics",
    nameKey: "services3Service5Name",
    summaryKey: "services3Service5Summary",
    priceKey: "services3Service5Price",
    timelineKey: "services3Service5Timeline",
    deliverable1Key: "services3Service5Deliverable1",
    deliverable2Key: "services3Service5Deliverable2",
  },
];

export function ExpandableServiceAccordionServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services3Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services3Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.services3Intro}</p>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {SERVICES.map((service) => (
            <AccordionItem key={service.id} value={service.id}>
              <AccordionTrigger>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                  <span className="text-fg text-base font-semibold">
                    {s[service.nameKey]}
                  </span>
                  <span className="text-muted text-sm font-normal">
                    {s[service.summaryKey]}
                  </span>
                </div>
                <IconChevronDown
                  size={18}
                  className="ml-3 shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="soft" size="sm">
                      {s[service.priceKey]}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {s[service.timelineKey]}
                    </Badge>
                  </div>
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-start gap-2.5">
                      <span className="bg-brand/10 text-brand mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                        <IconCheck size={12} aria-hidden="true" />
                      </span>
                      <span className="text-fg text-sm">
                        {s[service.deliverable1Key]}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-brand/10 text-brand mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                        <IconCheck size={12} aria-hidden="true" />
                      </span>
                      <span className="text-fg text-sm">
                        {s[service.deliverable2Key]}
                      </span>
                    </li>
                  </ul>
                  <Button variant="outline" size="sm" className="w-fit">
                    {s.services3CtaLabel}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
