"use client";

import { useState } from "react";
import {
  IconBuildingSkyscraper,
  IconBuildingWarehouse,
  IconHome,
  IconTent,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAddressBookMessages } from "@/types/pages/address-book/AddressBookMessages-types";

interface LocationSeed {
  id: string;
  icon: Icon;
  labelKey: string;
  line1Key: string;
  line2Key: string;
}

const LOCATION_SEEDS: LocationSeed[] = [
  {
    id: "home",
    icon: IconHome,
    labelKey: "addressBook2Card1Label",
    line1Key: "addressBook2Card1Line1",
    line2Key: "addressBook2Card1Line2",
  },
  {
    id: "office",
    icon: IconBuildingSkyscraper,
    labelKey: "addressBook2Card2Label",
    line1Key: "addressBook2Card2Line1",
    line2Key: "addressBook2Card2Line2",
  },
  {
    id: "warehouse",
    icon: IconBuildingWarehouse,
    labelKey: "addressBook2Card3Label",
    line1Key: "addressBook2Card3Line1",
    line2Key: "addressBook2Card3Line2",
  },
  {
    id: "cabin",
    icon: IconTent,
    labelKey: "addressBook2Card4Label",
    line1Key: "addressBook2Card4Line1",
    line2Key: "addressBook2Card4Line2",
  },
];

export function AddressCardGridAddressBook() {
  const t = useMessages("pages") as unknown as PagesWithAddressBookMessages;
  const ab = t.addressBook;

  const [locations, setLocations] = useState(() =>
    LOCATION_SEEDS.map((seed) => ({
      id: seed.id,
      icon: seed.icon,
      label: ab[seed.labelKey],
      line1: ab[seed.line1Key],
      line2: ab[seed.line2Key],
    })),
  );
  const [defaultId, setDefaultId] = useState<string | null>(
    LOCATION_SEEDS[0]?.id ?? null,
  );

  const handleRemove = (id: string) => {
    const next = locations.filter((location) => location.id !== id);
    setLocations(next);
    if (id === defaultId) {
      setDefaultId(next[0]?.id ?? null);
    }
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {ab.addressBook2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {ab.addressBook2Description}
          </Typography>
        </div>

        {locations.length === 0 ? (
          <div className="border-border rounded-xl border border-dashed p-10 text-center">
            <Typography variant="body" className="text-muted">
              {ab.addressBook2EmptyState}
            </Typography>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => {
              const isDefault = location.id === defaultId;
              return (
                <Card
                  key={location.id}
                  className={cn(
                    "flex flex-col gap-4 p-5",
                    isDefault && "ring-brand ring-2",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
                      <location.icon size={20} aria-hidden="true" />
                    </span>
                    {isDefault && (
                      <Badge variant="soft">{ab.addressBook2DefaultBadge}</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-fg text-sm font-semibold">
                      {location.label}
                    </span>
                    <span className="text-muted text-sm">{location.line1}</span>
                    <span className="text-muted text-sm">{location.line2}</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    {!isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setDefaultId(location.id)}
                      >
                        {ab.addressBook2SetDefault}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-muted hover:text-error",
                        isDefault && "flex-1",
                      )}
                      onClick={() => handleRemove(location.id)}
                    >
                      {ab.addressBook2Remove}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
