"use client";

import { IconClock } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function WithAvatarCard() {
  const t = useMessages("pages").acceptInvite;

  return (
    <section className="flex w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-md px-4 lg:px-8">
        <Card className="flex w-full flex-col items-center gap-6 p-8 text-center md:p-10">
          <Avatar size="xl" fallback="A" />

          <div className="flex flex-col gap-2">
            <Typography
              variant="h2"
              className="text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {t.ai2InviteHeading}{" "}
              <span className="font-light">{t.ai2CompanyName}</span>
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.ai2Description}
            </Typography>
          </div>

          <div className="flex w-full gap-3">
            <Button className="flex-1">{t.ai2Accept}</Button>
            <Button variant="outline" className="flex-1">
              {t.ai2Decline}
            </Button>
          </div>

          <div className="text-muted flex items-center gap-2">
            <IconClock size={16} className="shrink-0" />
            <Typography variant="caption">{t.ai2Expires}</Typography>
          </div>
        </Card>
      </div>
    </section>
  );
}
