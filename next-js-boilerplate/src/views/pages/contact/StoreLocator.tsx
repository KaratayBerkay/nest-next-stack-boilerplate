"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconChevronRight,
  IconClock,
  IconMapPin,
  IconPhone,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithContactMessages } from "@/types/pages/contact/ContactMessages-types";

interface Store {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  hours: string;
  zip: string;
}

const LINK_URL = "#" as const;

const STORES: Store[] = [
  {
    id: "mission",
    name: "Lumen Mission",
    distance: "1.2 km",
    address: "2987 Mission Street, San Francisco, CA",
    phone: "+1 415 555 0151",
    hours: "Mon–Sat, 9:00–19:00",
    zip: "94110",
  },
  {
    id: "soma",
    name: "Lumen SoMa",
    distance: "2.4 km",
    address: "100 Larkin Street, San Francisco, CA",
    phone: "+1 415 555 0152",
    hours: "Mon–Sun, 8:00–20:00",
    zip: "94103",
  },
  {
    id: "nob-hill",
    name: "Lumen Nob Hill",
    distance: "3.8 km",
    address: "1200 California Street, San Francisco, CA",
    phone: "+1 415 555 0153",
    hours: "Tue–Sun, 10:00–18:00",
    zip: "94109",
  },
  {
    id: "palo-alto",
    name: "Lumen Palo Alto",
    distance: "48 km",
    address: "650 University Avenue, Palo Alto, CA",
    phone: "+1 650 555 0154",
    hours: "Mon–Fri, 9:00–17:00",
    zip: "94301",
  },
];

function filterStores(zip: string): Store[] {
  const query = zip.trim();
  if (!query) return STORES;
  return STORES.filter((store) => store.zip.startsWith(query));
}

function handleZipChange(
  event: ChangeEvent<HTMLInputElement>,
  setZip: Dispatch<SetStateAction<string>>,
) {
  setZip(event.target.value);
}

function handleSearch(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

function selectStore(
  setSelectedId: Dispatch<SetStateAction<string>>,
  id: string,
) {
  setSelectedId(id);
}

export function StoreLocator() {
  const m = useMessages("pages") as unknown as PagesWithContactMessages;
  const co = m.contact;
  const [zip, setZip] = useState("");
  const [selectedId, setSelectedId] = useState(STORES[0].id);
  const filtered = filterStores(zip);
  const active = STORES.find((store) => store.id === selectedId) ?? STORES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:mb-16">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-4xl font-medium tracking-tighter md:text-5xl">
              {co.contact23Heading}
            </h2>
            <p className="text-muted">{co.contact23Description}</p>
          </div>
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              value={zip}
              onChange={(event) => handleZipChange(event, setZip)}
              placeholder={co.contact23SearchPlaceholder}
              className="flex-1"
              leftIcon={<IconSearch className="size-4" />}
            />
            <Button
              type="submit"
              variant="primary"
              className="!rounded-full px-6"
            >
              {co.contact23SearchButton}
            </Button>
          </form>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="flex flex-col gap-4 lg:max-h-[34rem] lg:overflow-y-auto lg:pr-2">
            {filtered.length === 0 ? (
              <p className="text-muted py-8 text-center text-sm">
                {co.contact23NoResults}
              </p>
            ) : (
              filtered.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => selectStore(setSelectedId, store.id)}
                  className={cn(
                    "border-border bg-surface flex w-full flex-col gap-4 rounded-2xl border p-5 text-left transition-all",
                    selectedId === store.id &&
                      "border-brand bg-surface-hover shadow-xs",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{store.name}</span>
                      <span className="text-muted text-sm">
                        {store.distance}
                      </span>
                    </div>
                    <IconChevronRight
                      className={cn(
                        "text-muted mt-1 size-4 shrink-0 transition-transform",
                        selectedId === store.id && "text-brand translate-x-0.5",
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="text-muted flex items-center gap-2">
                      <IconMapPin className="size-4 shrink-0" />
                      {store.address}
                    </span>
                    <span className="text-muted flex items-center gap-2">
                      <IconPhone className="size-4 shrink-0" />
                      {store.phone}
                    </span>
                    <span className="text-muted flex items-center gap-2">
                      <IconClock className="size-4 shrink-0" />
                      {store.hours}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 !rounded-full"
                    >
                      <a href={LINK_URL}>{co.contact23Directions}</a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="flex-1 !rounded-full"
                    >
                      <a href={LINK_URL}>{co.contact23Call}</a>
                    </Button>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-border bg-surface-hover/50 relative h-80 overflow-hidden rounded-3xl border lg:sticky lg:top-24">
            <div className="absolute inset-0 grid place-items-center">
              <IconMapPin className="text-brand size-10" />
            </div>
            <div className="absolute inset-x-4 bottom-4 lg:inset-x-6 lg:bottom-6">
              <div className="border-border bg-bg flex flex-col gap-2 rounded-2xl border p-4 shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{active.name}</span>
                  <span className="border-border bg-surface text-muted rounded-full border px-3 py-1 text-xs">
                    {active.distance}
                  </span>
                </div>
                <span className="text-muted text-sm">{active.address}</span>
                <div className="text-muted mt-1 flex items-center gap-2 text-sm">
                  <IconClock className="size-4 shrink-0" />
                  {active.hours}
                </div>
                <div className="text-muted flex items-center gap-2 text-sm">
                  <IconPhone className="size-4 shrink-0" />
                  {active.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
