"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBrandMastercard,
  IconBrandPaypal,
  IconBrandVisa,
  IconChevronDown,
  IconLeaf,
  IconRotate,
} from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithEcommerceFooterMessages } from "@/types/pages/ecommerce-footer/EcommerceFooterMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const SHOP_LINKS = [
  "ecommerceFooter20ShopLink1",
  "ecommerceFooter20ShopLink2",
  "ecommerceFooter20ShopLink3",
] as const;

const COMPANY_LINKS = [
  "ecommerceFooter20CompanyLink1",
  "ecommerceFooter20CompanyLink2",
  "ecommerceFooter20CompanyLink3",
] as const;

const PAYMENT_ICONS = [
  { icon: IconBrandVisa, ariaKey: "ecommerceFooter20PayVisaAria" },
  { icon: IconBrandMastercard, ariaKey: "ecommerceFooter20PayMastercardAria" },
  { icon: IconBrandPaypal, ariaKey: "ecommerceFooter20PayPaypalAria" },
] as const;

export function BrandStoryPaymentsEcommerceFooter() {
  const t = useMessages("pages") as unknown as PagesWithEcommerceFooterMessages;
  const f = t.ecommerceFooter;

  const [expanded, setExpanded] = useState(false);

  return (
    <footer className="border-border bg-surface w-full border-t">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <AspectRatio ratio={3 / 2} className="bg-bg rounded-2xl">
              <Image
                src={placeholderImage("ecommerce-footer-20-story", "3x2")}
                alt={f.ecommerceFooter20StoryTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </AspectRatio>
            <span className="text-fg text-lg font-semibold tracking-tight">
              {f.ecommerceFooter20StoryTitle}
            </span>
            <p className="text-muted text-sm">
              {f.ecommerceFooter20StoryShort}
              {expanded && <span> {f.ecommerceFooter20StoryMore}</span>}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              {expanded ? f.ecommerceFooter20StoryToggleLess : f.ecommerceFooter20StoryToggleMore}
              <IconChevronDown
                size={14}
                className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
                aria-hidden="true"
              />
            </Button>
            <div className="flex flex-wrap gap-2">
              <Badge variant="soft" pill className="gap-1.5">
                <IconLeaf size={14} aria-hidden="true" />
                {f.ecommerceFooter20TrustBadge1}
              </Badge>
              <Badge variant="soft" pill className="gap-1.5">
                <IconRotate size={14} aria-hidden="true" />
                {f.ecommerceFooter20TrustBadge2}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-fg text-sm font-semibold">
                  {f.ecommerceFooter20ShopTitle}
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
                  {f.ecommerceFooter20CompanyTitle}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {COMPANY_LINKS.map((key) => (
                    <li key={key}>
                      <Link href="#" className="text-muted hover:text-fg text-sm">
                        {f[key]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <span className="text-muted text-xs">{f.ecommerceFooter20PaymentsLabel}</span>
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
              <p className="text-muted text-xs">{f.ecommerceFooter20SecureNote}</p>
            </div>
          </div>
        </div>

        <Separator className="my-10" />
        <span className="text-muted text-xs">{f.ecommerceFooter20Copyright}</span>
      </div>
    </footer>
  );
}
