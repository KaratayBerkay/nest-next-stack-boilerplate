"use client";

import Link from "next/link";
import { IconBriefcase, IconLifebuoy, IconPuzzle } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const SECTIONS: {
  id: string;
  icon: Icon;
  titleKey: string;
  linkKeys: readonly string[];
}[] = [
  {
    id: "product",
    icon: IconPuzzle,
    titleKey: "footer58ColProductTitle",
    linkKeys: ["footer58ColProductLink1", "footer58ColProductLink2"],
  },
  {
    id: "company",
    icon: IconBriefcase,
    titleKey: "footer58ColCompanyTitle",
    linkKeys: ["footer58ColCompanyLink1", "footer58ColCompanyLink2"],
  },
  {
    id: "support",
    icon: IconLifebuoy,
    titleKey: "footer58ColSupportTitle",
    linkKeys: ["footer58ColSupportLink1", "footer58ColSupportLink2"],
  },
];

export function SectionTitleIconsFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <div key={section.id} className="flex flex-col gap-3">
              <span className="bg-brand/10 text-brand flex size-9 items-center justify-center rounded-lg">
                <section.icon size={18} aria-hidden="true" />
              </span>
              <span className="text-fg text-sm font-semibold">
                {f[section.titleKey]}
              </span>
              <ul className="flex flex-col gap-2">
                {section.linkKeys.map((linkKey) => (
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
        <div className="border-border mt-10 border-t pt-6">
          <span className="text-muted text-xs">{f.footer58Copyright}</span>
        </div>
      </div>
    </footer>
  );
}
