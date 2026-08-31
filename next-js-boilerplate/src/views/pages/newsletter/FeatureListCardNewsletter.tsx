"use client";

import { useState } from "react";
import {
  IconBolt,
  IconChartBar,
  IconGift,
  IconMail,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithNewsletterMessages } from "@/types/pages/newsletter/NewsletterMessages-types";

const FEATURES = [
  {
    id: "feature-1",
    icon: IconBolt,
    titleKey: "newsletter4Feature1Title",
    descKey: "newsletter4Feature1Desc",
  },
  {
    id: "feature-2",
    icon: IconChartBar,
    titleKey: "newsletter4Feature2Title",
    descKey: "newsletter4Feature2Desc",
  },
  {
    id: "feature-3",
    icon: IconGift,
    titleKey: "newsletter4Feature3Title",
    descKey: "newsletter4Feature3Desc",
  },
] as const;

const FREQUENCIES = [
  { value: "weekly", labelKey: "newsletter4FreqWeekly" },
  { value: "monthly", labelKey: "newsletter4FreqMonthly" },
] as const;

export function FeatureListCardNewsletter() {
  const t = useMessages("pages") as unknown as PagesWithNewsletterMessages;
  const n = t.newsletter;
  const [frequency, setFrequency] = useState("weekly");
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
              {n.newsletter4Heading}
            </h2>
            <p className="text-muted text-base">{n.newsletter4Body}</p>
          </div>
          <ul className="flex flex-col gap-5">
            {FEATURES.map((feature) => (
              <li key={feature.id} className="flex items-start gap-3.5">
                <span className="border-border bg-surface text-brand flex size-9 shrink-0 items-center justify-center rounded-lg border">
                  <feature.icon size={18} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-fg text-sm font-semibold">
                    {n[feature.titleKey]}
                  </span>
                  <span className="text-muted text-sm">
                    {n[feature.descKey]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Card variant="default">
          <CardHeader title={n.newsletter4FormTitle}>
            <CardDescription>{n.newsletter4FormSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-fg text-sm font-medium">
                  {n.newsletter4EmailLabel}
                </span>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={n.newsletter4Placeholder}
                  leftIcon={<IconMail size={16} aria-hidden="true" />}
                />
              </div>
              <RadioGroup
                value={frequency}
                onValueChange={setFrequency}
                className="grid-cols-2 gap-2.5"
              >
                {FREQUENCIES.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`newsletter4-freq-${option.value}`}
                    className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2 rounded-lg border p-2.5"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`newsletter4-freq-${option.value}`}
                    />
                    <span className="text-fg text-sm">
                      {n[option.labelKey]}
                    </span>
                  </label>
                ))}
              </RadioGroup>
              <Checkbox
                label={n.newsletter4TermsLabel}
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!agreed || !email}
                className="w-full"
              >
                {n.newsletter4Submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
