"use client";

import { IconMapPin } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CITIES = [
  {
    id: "sf",
    cityKey: "feature41City1Name",
    addressKey: "feature41City1Address",
  },
  {
    id: "ny",
    cityKey: "feature41City2Name",
    addressKey: "feature41City2Address",
  },
  {
    id: "london",
    cityKey: "feature41City3Name",
    addressKey: "feature41City3Address",
  },
  {
    id: "singapore",
    cityKey: "feature41City4Name",
    addressKey: "feature41City4Address",
  },
] as const;

export function CityAddressGridFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature41Heading}
          </h2>
          <p className="text-muted self-end">{f.feature41Intro}</p>
        </div>
        <div className="border-border mt-12 grid gap-8 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.map((city) => (
            <div key={city.id} className="flex flex-col gap-2.5">
              <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
                <IconMapPin size={18} aria-hidden="true" />
              </span>
              <h3 className="text-fg text-sm font-semibold">
                {f[city.cityKey]}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {f[city.addressKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
