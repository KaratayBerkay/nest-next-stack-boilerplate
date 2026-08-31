"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconPhoneCall,
  IconUsers,
  IconBroadcast,
  IconChevronRight,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";

/** Fixed accent per surface — calls wear the brand, meetings the calm info
 *  hue, live the broadcast red used by every LIVE badge in the app. */
const SECTIONS = [
  {
    key: "calls",
    Icon: IconPhoneCall,
    href: "calls",
    chip: "bg-brand/10 text-brand",
  },
  {
    key: "meetings",
    Icon: IconUsers,
    href: "meetings",
    chip: "bg-info/10 text-info",
  },
  {
    key: "live",
    Icon: IconBroadcast,
    href: "live",
    chip: "bg-error/10 text-error",
  },
] as const;

export function RtcHubView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-muted mt-1">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map(({ key, Icon, href, chip }) => (
          <Link
            key={key}
            href={`/v1/${lang}/rtc/${href}`}
            className="group border-border bg-surface hover:border-brand/50 focus-visible:ring-brand flex flex-col gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <span
              className={`flex size-11 items-center justify-center rounded-lg ${chip}`}
            >
              <Icon size={22} aria-hidden />
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="text-base font-semibold">
                {t[`${key}Title` as const]}
              </span>
              <IconChevronRight
                size={16}
                aria-hidden
                className="text-muted transition-transform group-hover:translate-x-0.5"
              />
            </span>
            <span className="text-muted text-sm">
              {t[`${key}Description` as const]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
