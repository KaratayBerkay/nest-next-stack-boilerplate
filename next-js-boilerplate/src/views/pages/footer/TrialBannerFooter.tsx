"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const COLUMNS = [
  {
    id: "product",
    titleKey: "footer13ColProductTitle",
    linkKeys: ["footer13ColProductLink1", "footer13ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer13ColCompanyTitle",
    linkKeys: ["footer13ColCompanyLink1", "footer13ColCompanyLink2"],
  },
] as const;
const SOCIALS = [
  { icon: IconBrandX, ariaKey: "footer13Social1Aria" },
  { icon: IconBrandGithub, ariaKey: "footer13Social2Aria" },
] as const;

export function TrialBannerFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="bg-fg text-bg w-full py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="border-bg/15 flex flex-col gap-5 border-b pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-2xl font-semibold tracking-tight">
              {f.footer13TrialHeading}
            </h3>
            <p className="text-bg/70 text-sm">{f.footer13TrialBody}</p>
          </div>
          <form className="flex w-full max-w-sm gap-2">
            <Input
              type="email"
              placeholder={f.footer13TrialPlaceholder}
              className="bg-bg/10 border-bg/20 text-bg placeholder:text-bg/50 flex-1"
            />
            <Button type="submit" variant="shadow" className="shrink-0">
              {f.footer13TrialSubmit}
              <IconArrowRight size={14} aria-hidden="true" />
            </Button>
          </form>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold">{f[col.titleKey]}</span>
              <ul className="flex flex-col gap-2">
                {col.linkKeys.map((linkKey) => (
                  <li key={linkKey}>
                    <Link href="#" className="text-bg/70 hover:text-bg text-sm">
                      {f[linkKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <span className="text-bg/60 text-xs">{f.footer13Copyright}</span>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <Link
                key={social.ariaKey}
                href="#"
                aria-label={f[social.ariaKey]}
                className="text-bg/70 hover:text-bg"
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
