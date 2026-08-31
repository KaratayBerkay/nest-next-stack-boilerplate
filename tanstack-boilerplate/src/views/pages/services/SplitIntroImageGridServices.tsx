"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface ServiceTile {
  id: string;
  seed: string;
  nameKey: string;
  blurbKey: string;
  imageAltKey: string;
}

const SERVICES: ServiceTile[] = [
  {
    id: "consulting",
    seed: "services7-consulting",
    nameKey: "services7Service1Name",
    blurbKey: "services7Service1Blurb",
    imageAltKey: "services7Service1ImageAlt",
  },
  {
    id: "implementation",
    seed: "services7-implementation",
    nameKey: "services7Service2Name",
    blurbKey: "services7Service2Blurb",
    imageAltKey: "services7Service2ImageAlt",
  },
  {
    id: "training",
    seed: "services7-training",
    nameKey: "services7Service3Name",
    blurbKey: "services7Service3Blurb",
    imageAltKey: "services7Service3ImageAlt",
  },
  {
    id: "support-plans",
    seed: "services7-support-plans",
    nameKey: "services7Service4Name",
    blurbKey: "services7Service4Blurb",
    imageAltKey: "services7Service4ImageAlt",
  },
];

export function SplitIntroImageGridServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-14">
          <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <span className="text-brand text-xs font-semibold tracking-wider uppercase">
              {s.services7Eyebrow}
            </span>
            <h2 className="text-fg text-3xl font-semibold tracking-tight">
              {s.services7Heading}
            </h2>
            <p className="text-muted leading-relaxed">{s.services7Intro}</p>
            <Button variant="primary" className="w-fit">
              {s.services7Cta}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <div key={service.id} className="flex flex-col gap-3">
                <AspectRatio ratio={4 / 3} className="bg-surface rounded-xl">
                  <Image
                    src={placeholderImage(service.seed, "4x3")}
                    alt={s[service.imageAltKey]}
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-cover"
                  />
                </AspectRatio>
                <h3 className="text-fg text-base font-semibold">{s[service.nameKey]}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {s[service.blurbKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
