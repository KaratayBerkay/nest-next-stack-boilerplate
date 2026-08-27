"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { IconPhoneCall, IconUsers, IconBroadcast } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const SECTIONS = [
  { key: "calls", Icon: IconPhoneCall, href: "calls", live: true },
  { key: "meetings", Icon: IconUsers, href: "meetings", live: true },
  { key: "live", Icon: IconBroadcast, href: "live", live: true },
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
        {SECTIONS.map(({ key, Icon, href, live }) => {
          const card = (
            <Card
              className={
                live ? "hover:border-brand/50 transition-colors" : undefined
              }
            >
              <CardHeader>
                <Icon className="text-muted size-6" aria-hidden />
                <CardTitle>{t[`${key}Title` as const]}</CardTitle>
                <CardDescription>
                  {t[`${key}Description` as const]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!live && <Badge>{t.comingSoon}</Badge>}
              </CardContent>
            </Card>
          );
          return live ? (
            <Link key={key} href={`/v1/${lang}/rtc/${href}`}>
              {card}
            </Link>
          ) : (
            <div key={key}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
