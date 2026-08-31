"use client";

import { IconClock, IconPoint } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

interface ServiceCard {
  id: string;
  nameKey: string;
  durationKey: string;
  priceKey: string;
  descriptionKey: string;
  deliverable1Key: string;
  deliverable2Key: string;
}

const SERVICES: ServiceCard[] = [
  {
    id: "audit",
    nameKey: "services5Service1Name",
    durationKey: "services5Service1Duration",
    priceKey: "services5Service1Price",
    descriptionKey: "services5Service1Description",
    deliverable1Key: "services5Service1Deliverable1",
    deliverable2Key: "services5Service1Deliverable2",
  },
  {
    id: "redesign",
    nameKey: "services5Service2Name",
    durationKey: "services5Service2Duration",
    priceKey: "services5Service2Price",
    descriptionKey: "services5Service2Description",
    deliverable1Key: "services5Service2Deliverable1",
    deliverable2Key: "services5Service2Deliverable2",
  },
  {
    id: "build",
    nameKey: "services5Service3Name",
    durationKey: "services5Service3Duration",
    priceKey: "services5Service3Price",
    descriptionKey: "services5Service3Description",
    deliverable1Key: "services5Service3Deliverable1",
    deliverable2Key: "services5Service3Deliverable2",
  },
  {
    id: "retainer",
    nameKey: "services5Service4Name",
    durationKey: "services5Service4Duration",
    priceKey: "services5Service4Price",
    descriptionKey: "services5Service4Description",
    deliverable1Key: "services5Service4Deliverable1",
    deliverable2Key: "services5Service4Deliverable2",
  },
];

export function DurationPricingCardsServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services5Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.services5Intro}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Card key={service.id} variant="default">
              <CardHeader>
                <span className="text-fg text-base font-semibold">
                  {s[service.nameKey]}
                </span>
                <Badge variant="outline" size="sm" className="w-fit">
                  <IconClock size={13} className="mr-1" aria-hidden="true" />
                  {s[service.durationKey]}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-fg text-2xl font-semibold tracking-tight tabular-nums">
                  {s[service.priceKey]}
                </p>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {s[service.descriptionKey]}
                </p>
                <ul className="mt-4 flex flex-col gap-1.5">
                  <li className="text-muted flex items-center gap-1.5 text-xs">
                    <IconPoint
                      size={14}
                      aria-hidden="true"
                      className="text-brand shrink-0"
                    />
                    {s[service.deliverable1Key]}
                  </li>
                  <li className="text-muted flex items-center gap-1.5 text-xs">
                    <IconPoint
                      size={14}
                      aria-hidden="true"
                      className="text-brand shrink-0"
                    />
                    {s[service.deliverable2Key]}
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                >
                  {s.services5CtaLabel}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
