"use client";

import Link from "next/link";
import {
  IconBrandApple,
  IconBrandGooglePlay,
  IconBrandMastercard,
  IconBrandPaypal,
  IconBrandVisa,
  IconClock,
  IconMapPin,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceFooterMessages } from "@/types/pages/ecommerce-footer/EcommerceFooterMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface StoreLocation {
  id: string;
  nameKey: string;
  addressKey: string;
  hoursKey: string;
  seed: string;
}

const STORES: StoreLocation[] = [
  {
    id: "soho",
    nameKey: "ecommerceFooter9Store1Name",
    addressKey: "ecommerceFooter9Store1Address",
    hoursKey: "ecommerceFooter9Store1Hours",
    seed: "ecommerce-footer-9-store-1",
  },
  {
    id: "shoreditch",
    nameKey: "ecommerceFooter9Store2Name",
    addressKey: "ecommerceFooter9Store2Address",
    hoursKey: "ecommerceFooter9Store2Hours",
    seed: "ecommerce-footer-9-store-2",
  },
];

const SHOP_LINKS = [
  "ecommerceFooter9ShopLink1",
  "ecommerceFooter9ShopLink2",
  "ecommerceFooter9ShopLink3",
] as const;

const SUPPORT_LINKS = [
  "ecommerceFooter9SupportLink1",
  "ecommerceFooter9SupportLink2",
  "ecommerceFooter9SupportLink3",
] as const;

const PAYMENT_ICONS = [
  { icon: IconBrandVisa, ariaKey: "ecommerceFooter9PayVisaAria" },
  { icon: IconBrandMastercard, ariaKey: "ecommerceFooter9PayMastercardAria" },
  { icon: IconBrandPaypal, ariaKey: "ecommerceFooter9PayPaypalAria" },
] as const;

export function StoreLocatorPaymentsEcommerceFooter() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceFooterMessages;
  const f = t.ecommerceFooter;

  return (
    <footer className="border-border bg-surface w-full border-t">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.ecommerceFooter9Brand}
            </span>
            <p className="text-muted text-sm">{f.ecommerceFooter9About}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="#">
                  <IconBrandApple size={16} aria-hidden="true" />
                  {f.ecommerceFooter9AppStoreLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="#">
                  <IconBrandGooglePlay size={16} aria-hidden="true" />
                  {f.ecommerceFooter9GooglePlayLabel}
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-fg text-sm font-semibold">
              {f.ecommerceFooter9ShopTitle}
            </span>
            <ul className="flex flex-col gap-2.5">
              {SHOP_LINKS.map((key) => (
                <li key={key}>
                  <Link href="#" className="text-muted hover:text-fg text-sm">
                    {f[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-fg text-sm font-semibold">
              {f.ecommerceFooter9SupportTitle}
            </span>
            <ul className="flex flex-col gap-2.5">
              {SUPPORT_LINKS.map((key) => (
                <li key={key}>
                  <Link href="#" className="text-muted hover:text-fg text-sm">
                    {f[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-fg text-sm font-semibold">
              {f.ecommerceFooter9StoresTitle}
            </span>
            <ul className="flex flex-col gap-4">
              {STORES.map((store) => (
                <li key={store.id} className="flex items-start gap-3">
                  <Avatar
                    src={placeholderImage(store.seed, "1x1")}
                    alt={f[store.nameKey]}
                    fallback={f[store.nameKey]}
                    size="sm"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {f[store.nameKey]}
                    </span>
                    <span className="text-muted flex items-start gap-1.5 text-xs">
                      <IconMapPin
                        size={14}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      {f[store.addressKey]}
                    </span>
                    <span className="text-muted flex items-center gap-1.5 text-xs">
                      <IconClock
                        size={14}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      {f[store.hoursKey]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-muted text-xs">
            {f.ecommerceFooter9Copyright}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-muted flex items-center gap-1.5 text-xs">
              <IconShieldCheck size={14} aria-hidden="true" />
              {f.ecommerceFooter9SecureBadge}
            </span>
            <span className="text-muted text-xs">
              {f.ecommerceFooter9PaymentsLabel}
            </span>
            <div className="flex gap-2">
              {PAYMENT_ICONS.map((pay) => (
                <span
                  key={pay.ariaKey}
                  aria-label={f[pay.ariaKey]}
                  className="border-border bg-bg text-muted flex size-8 items-center justify-center rounded-md border"
                >
                  <pay.icon size={18} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
