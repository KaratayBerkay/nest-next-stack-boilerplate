"use client";

import Link from "next/link";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const PRIMARY_TIER = [
  {
    id: "product",
    titleKey: "footer19ColProductTitle",
    linkKeys: [
      "footer19ColProductLink1",
      "footer19ColProductLink2",
      "footer19ColProductLink3",
    ],
  },
  {
    id: "solutions",
    titleKey: "footer19ColSolutionsTitle",
    linkKeys: [
      "footer19ColSolutionsLink1",
      "footer19ColSolutionsLink2",
      "footer19ColSolutionsLink3",
    ],
  },
] as const;
const SECONDARY_TIER = [
  {
    id: "company",
    titleKey: "footer19ColCompanyTitle",
    linkKeys: ["footer19ColCompanyLink1", "footer19ColCompanyLink2"],
  },
  {
    id: "legal",
    titleKey: "footer19ColLegalTitle",
    linkKeys: ["footer19ColLegalLink1", "footer19ColLegalLink2"],
  },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer19Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer19Social2Aria" },
] as const;

export function TwoTierMegaFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-border grid gap-8 border-b pb-10 sm:grid-cols-2">
          {PRIMARY_TIER.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <span className="text-fg text-base font-semibold">
                {f[col.titleKey]}
              </span>
              <ul className="flex flex-col gap-2">
                {col.linkKeys.map((linkKey) => (
                  <li key={linkKey}>
                    <Link href="#" className="text-muted hover:text-fg text-sm">
                      {f[linkKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {SECONDARY_TIER.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">
                {f[col.titleKey]}
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {col.linkKeys.map((linkKey) => (
                  <Link
                    key={linkKey}
                    href="#"
                    className="text-muted hover:text-fg text-sm"
                  >
                    {f[linkKey]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-border mt-10 flex items-center justify-between border-t pt-6">
          <span className="text-muted text-xs">{f.footer19Copyright}</span>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link
                key={social.ariaKey}
                href="#"
                aria-label={f[social.ariaKey]}
                className="text-muted hover:text-fg"
              >
                <social.icon size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
