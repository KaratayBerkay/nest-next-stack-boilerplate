"use client";

import { useState } from "react";
import Image from "next/image";
import { IconArrowRight } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface ServiceEntry {
  id: string;
  seed: string;
  nameKey: string;
  blurbKey: string;
  imageAltKey: string;
}

const SERVICES: ServiceEntry[] = [
  {
    id: "product-strategy",
    seed: "services4-product-strategy",
    nameKey: "services4Service1Name",
    blurbKey: "services4Service1Blurb",
    imageAltKey: "services4Service1ImageAlt",
  },
  {
    id: "interface-design",
    seed: "services4-interface-design",
    nameKey: "services4Service2Name",
    blurbKey: "services4Service2Blurb",
    imageAltKey: "services4Service2ImageAlt",
  },
  {
    id: "engineering",
    seed: "services4-engineering",
    nameKey: "services4Service3Name",
    blurbKey: "services4Service3Blurb",
    imageAltKey: "services4Service3ImageAlt",
  },
  {
    id: "launch-growth",
    seed: "services4-launch-growth",
    nameKey: "services4Service4Name",
    blurbKey: "services4Service4Blurb",
    imageAltKey: "services4Service4ImageAlt",
  },
  {
    id: "ongoing-care",
    seed: "services4-ongoing-care",
    nameKey: "services4Service5Name",
    blurbKey: "services4Service5Blurb",
    imageAltKey: "services4Service5ImageAlt",
  },
];

export function HoverPreviewListServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;
  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);

  const active =
    SERVICES.find((service) => service.id === activeId) ?? SERVICES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services4Eyebrow}
          </span>
          <h2 className="text-fg max-w-xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services4Heading}
          </h2>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ul aria-label={s.services4ListAria} className="flex flex-col">
            {SERVICES.map((service) => {
              const isActive = service.id === activeId;
              return (
                <li key={service.id} className="border-border border-b">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveId(service.id)}
                    onFocus={() => setActiveId(service.id)}
                    onClick={() => setActiveId(service.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 py-5 text-left transition-colors",
                      isActive ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-lg font-semibold">
                        {s[service.nameKey]}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-normal transition-opacity",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      >
                        {s[service.blurbKey]}
                      </span>
                    </span>
                    <IconArrowRight
                      size={18}
                      aria-hidden="true"
                      className={cn(
                        "shrink-0 transition-transform",
                        isActive && "translate-x-1",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <AspectRatio ratio={4 / 3} className="bg-surface rounded-2xl">
              <Image
                src={placeholderImage(active.seed, "4x3")}
                alt={s[active.imageAltKey]}
                fill
                sizes="(max-width: 1024px) 100vw, 576px"
                className="object-cover"
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
}
