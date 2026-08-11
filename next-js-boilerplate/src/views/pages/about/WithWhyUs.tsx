"use client";

import {
  IconArrowUpRight,
  IconAward,
  IconBolt,
  IconEye,
  IconHeadset,
  IconShield,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const WHY_US_ITEMS = [
  {
    icon: IconAward,
    titleKey: "a16ExpertiseTitle",
    bodyKey: "a16ExpertiseBody",
  },
  { icon: IconHeadset, titleKey: "a16SupportTitle", bodyKey: "a16SupportBody" },
  {
    icon: IconShield,
    titleKey: "a16SecurityTitle",
    bodyKey: "a16SecurityBody",
  },
  { icon: IconBolt, titleKey: "a16SpeedTitle", bodyKey: "a16SpeedBody" },
  {
    icon: IconEye,
    titleKey: "a16TransparencyTitle",
    bodyKey: "a16TransparencyBody",
  },
  {
    icon: IconTrendingUp,
    titleKey: "a16ScalabilityTitle",
    bodyKey: "a16ScalabilityBody",
  },
] as const;

export function WithWhyUs() {
  const t = useMessages("pages").about;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:gap-16 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography variant="overline">{t.a16Label}</Typography>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter md:text-5xl"
          >
            {t.a16Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {t.a16Body}
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {WHY_US_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.titleKey}
                className="flex flex-col gap-4 p-6 lg:p-8"
              >
                <div className="bg-muted flex h-fit w-fit rounded-xl p-3">
                  <Icon size={24} className="text-brand" />
                </div>
                <div className="flex flex-col gap-2">
                  <Typography
                    variant="h3"
                    className="text-xl font-medium tracking-tight"
                  >
                    {t[item.titleKey]}
                  </Typography>
                  <Typography variant="body" className="text-muted">
                    {t[item.bodyKey]}
                  </Typography>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted flex flex-col items-start justify-between gap-6 rounded-2xl p-8 md:flex-row md:items-center md:p-12">
          <div className="flex max-w-xl flex-col gap-3">
            <Typography
              variant="h3"
              className="text-2xl font-medium tracking-tighter md:text-3xl"
            >
              {t.a16CtaHeading}
            </Typography>
            <Typography variant="body" className="text-muted">
              {t.a16CtaBody}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">{t.a16CtaPrimary}</Button>
            <Button
              variant="outline"
              rightIcon={<IconArrowUpRight size={16} />}
            >
              {t.a16CtaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
