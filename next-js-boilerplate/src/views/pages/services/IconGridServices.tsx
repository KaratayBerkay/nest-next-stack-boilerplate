"use client";

import {
  IconArrowUpRight,
  IconChartBar,
  IconCode,
  IconHeadset,
  IconPalette,
  IconShieldCheck,
  IconSpeakerphone,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

interface ServiceEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  descriptionKey: string;
  feature1Key: string;
  feature2Key: string;
}

const SERVICES: ServiceEntry[] = [
  {
    id: "development",
    icon: IconCode,
    nameKey: "services1Service1Name",
    descriptionKey: "services1Service1Description",
    feature1Key: "services1Service1Feature1",
    feature2Key: "services1Service1Feature2",
  },
  {
    id: "design",
    icon: IconPalette,
    nameKey: "services1Service2Name",
    descriptionKey: "services1Service2Description",
    feature1Key: "services1Service2Feature1",
    feature2Key: "services1Service2Feature2",
  },
  {
    id: "marketing",
    icon: IconSpeakerphone,
    nameKey: "services1Service3Name",
    descriptionKey: "services1Service3Description",
    feature1Key: "services1Service3Feature1",
    feature2Key: "services1Service3Feature2",
  },
  {
    id: "analytics",
    icon: IconChartBar,
    nameKey: "services1Service4Name",
    descriptionKey: "services1Service4Description",
    feature1Key: "services1Service4Feature1",
    feature2Key: "services1Service4Feature2",
  },
  {
    id: "support",
    icon: IconHeadset,
    nameKey: "services1Service5Name",
    descriptionKey: "services1Service5Description",
    feature1Key: "services1Service5Feature1",
    feature2Key: "services1Service5Feature2",
  },
  {
    id: "security",
    icon: IconShieldCheck,
    nameKey: "services1Service6Name",
    descriptionKey: "services1Service6Description",
    feature1Key: "services1Service6Feature1",
    feature2Key: "services1Service6Feature2",
  },
];

export function IconGridServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services1Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services1Heading}
          </h2>
          <p className="text-muted leading-relaxed">{s.services1Intro}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="border-border bg-bg group flex flex-col gap-4 rounded-xl border p-6 transition-shadow hover:shadow-md"
            >
              <span className="border-border bg-surface flex size-11 shrink-0 items-center justify-center rounded-lg border">
                <service.icon
                  size={22}
                  aria-hidden="true"
                  className="text-brand"
                />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-fg text-base font-semibold">
                  {s[service.nameKey]}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {s[service.descriptionKey]}
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                <li className="text-muted flex items-start gap-2 text-sm">
                  <span
                    className="bg-brand mt-1.5 size-1 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  {s[service.feature1Key]}
                </li>
                <li className="text-muted flex items-start gap-2 text-sm">
                  <span
                    className="bg-brand mt-1.5 size-1 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  {s[service.feature2Key]}
                </li>
              </ul>
              <button
                type="button"
                className="text-fg group-hover:text-brand mt-auto flex w-fit items-center gap-1 text-sm font-medium transition-colors"
              >
                {s.services1CtaLabel}
                <IconArrowUpRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
