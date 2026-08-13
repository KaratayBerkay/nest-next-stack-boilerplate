"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  IconArrowUpRight,
  IconBriefcase,
  IconHeartHandshake,
  IconLifebuoy,
  IconMapPin,
  IconNews,
  IconPhone,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

const SLIDE_INTERVAL_MS = 4500;

interface Department {
  id: string;
  titleKey: string;
  descriptionKey: string;
  linkKey: string;
  icon: Icon;
  city: string;
  address: string;
  phone: string;
  seed: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: "sales",
    titleKey: "contact4Dept1Title",
    descriptionKey: "contact4Dept1Description",
    linkKey: "contact4Dept1Link",
    icon: IconHeartHandshake,
    city: "New York",
    address: "350 Fifth Avenue, New York, NY 10118",
    phone: "+1 (212) 555-0134",
    seed: "contact4-new-york",
  },
  {
    id: "support",
    titleKey: "contact4Dept2Title",
    descriptionKey: "contact4Dept2Description",
    linkKey: "contact4Dept2Link",
    icon: IconLifebuoy,
    city: "London",
    address: "221B Baker Street, London NW1 6XE",
    phone: "+44 20 7946 0958",
    seed: "contact4-london",
  },
  {
    id: "careers",
    titleKey: "contact4Dept3Title",
    descriptionKey: "contact4Dept3Description",
    linkKey: "contact4Dept3Link",
    icon: IconBriefcase,
    city: "San Francisco",
    address: "1 Market Street, San Francisco, CA 94105",
    phone: "+1 (415) 555-0178",
    seed: "contact4-san-francisco",
  },
  {
    id: "press",
    titleKey: "contact4Dept4Title",
    descriptionKey: "contact4Dept4Description",
    linkKey: "contact4Dept4Link",
    icon: IconNews,
    city: "Singapore",
    address: "10 Anson Road, Singapore 079903",
    phone: "+65 6555 0119",
    seed: "contact4-singapore",
  },
];

function handleSelectDepartment(
  index: number,
  setActiveIndex: Dispatch<SetStateAction<number>>,
) {
  setActiveIndex(index);
}

export function DepartmentCardsCarousel() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDepartment = DEPARTMENTS[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % DEPARTMENTS.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <h2 className="text-fg text-4xl font-medium tracking-tight lg:text-5xl">
                {co.contact4Title}
              </h2>
              <p className="text-muted leading-relaxed">
                {co.contact4Description}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {DEPARTMENTS.map((department, index) => {
                const Icon = department.icon;
                const isActive = index === activeIndex;
                return (
                  <div
                    key={department.id}
                    className={
                      isActive
                        ? "border-brand bg-surface flex flex-col gap-4 rounded-3xl border p-5"
                        : "border-border hover:bg-surface-hover flex flex-col gap-4 rounded-3xl border p-5 transition-colors"
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-muted/15 text-fg flex size-10 items-center justify-center rounded-2xl">
                          <Icon size={20} />
                        </span>
                        <h3 className="font-medium">
                          {co[department.titleKey]}
                        </h3>
                      </div>
                      <button
                        type="button"
                        aria-pressed={isActive}
                        aria-label={co[department.titleKey]}
                        onClick={() =>
                          handleSelectDepartment(index, setActiveIndex)
                        }
                        className="text-brand flex items-center gap-1 text-sm font-medium"
                      >
                        {co[department.linkKey]}
                        <IconArrowUpRight size={16} />
                      </button>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">
                      {co[department.descriptionKey]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="border-border relative aspect-[4/3] overflow-hidden rounded-3xl border">
              {DEPARTMENTS.map((department, index) => (
                <div
                  key={department.id}
                  className={
                    index === activeIndex
                      ? "absolute inset-0 transition-opacity duration-700"
                      : "absolute inset-0 opacity-0 transition-opacity duration-700"
                  }
                >
                  <Image
                    src={`https://picsum.photos/seed/${department.seed}/1200/800`}
                    alt={department.city}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
              <div className="border-border bg-surface absolute bottom-4 left-4 flex flex-col gap-3 rounded-2xl border p-4">
                <div className="flex items-center gap-2">
                  <IconMapPin size={16} className="text-brand" />
                  <span className="font-medium">{activeDepartment.city}</span>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {activeDepartment.address}
                </p>
                <div className="flex items-center gap-2">
                  <IconPhone size={14} className="text-muted" />
                  <span className="text-muted text-sm">
                    {activeDepartment.phone}
                  </span>
                </div>
              </div>
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                {DEPARTMENTS.map((department, index) => (
                  <button
                    key={department.id}
                    type="button"
                    aria-label={department.city}
                    onClick={() =>
                      handleSelectDepartment(index, setActiveIndex)
                    }
                    className={
                      index === activeIndex
                        ? "bg-brand size-2.5 rounded-full transition-colors"
                        : "bg-muted/30 hover:bg-muted/50 size-2.5 rounded-full transition-colors"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
