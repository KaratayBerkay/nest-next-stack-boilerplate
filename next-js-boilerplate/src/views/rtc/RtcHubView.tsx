"use client";

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
  { key: "calls", Icon: IconPhoneCall },
  { key: "meetings", Icon: IconUsers },
  { key: "live", Icon: IconBroadcast },
] as const;

export function RtcHubView() {
  const t = useMessages("rtc");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-fg-muted mt-1">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map(({ key, Icon }) => (
          <Card key={key}>
            <CardHeader>
              <Icon className="text-fg-muted size-6" aria-hidden />
              <CardTitle>{t[`${key}Title` as const]}</CardTitle>
              <CardDescription>
                {t[`${key}Description` as const]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{t.comingSoon}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
