"use client";

import Link from "next/link";
import {
  IconBook,
  IconBriefcase,
  IconBrandGithub,
  IconBrandX,
  IconPuzzle,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS: {
  id: string;
  icon: Icon;
  titleKey: string;
  linkKeys: readonly string[];
}[] = [
  {
    id: "product",
    icon: IconPuzzle,
    titleKey: "footer21ColProductTitle",
    linkKeys: ["footer21ColProductLink1", "footer21ColProductLink2"],
  },
  {
    id: "company",
    icon: IconBriefcase,
    titleKey: "footer21ColCompanyTitle",
    linkKeys: ["footer21ColCompanyLink1", "footer21ColCompanyLink2"],
  },
  {
    id: "resources",
    icon: IconBook,
    titleKey: "footer21ColResourcesTitle",
    linkKeys: ["footer21ColResourcesLink1", "footer21ColResourcesLink2"],
  },
];
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer21Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer21Social2Aria" },
] as const;

export function IconLabeledColumnsFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-2 pb-8">
          <span className="text-fg text-lg font-semibold tracking-tight">
            {f.footer21Logo}
          </span>
          <p className="text-muted max-w-xs text-sm">{f.footer21Tagline}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg inline-flex items-center gap-2 text-sm font-semibold">
                <col.icon size={16} className="text-brand" aria-hidden="true" />
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
        <div className="border-border mt-10 flex items-center justify-between border-t pt-6">
          <span className="text-muted text-xs">{f.footer21Copyright}</span>
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
