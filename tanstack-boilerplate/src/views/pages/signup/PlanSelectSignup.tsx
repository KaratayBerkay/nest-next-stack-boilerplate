"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { IconBolt, IconCircleCheck, IconRocket, IconUsers } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSignupMessages } from "@/types/pages/signup/SignupMessages-types";

const LINK_URL = "#" as const;

interface PlanEntry {
  id: string;
  icon: Icon;
  nameKey: string;
  priceKey: string;
  priceSuffixKey: string;
  taglineKey: string;
  featureKey: string;
  recommended?: boolean;
}

const PLANS: PlanEntry[] = [
  {
    id: "starter",
    icon: IconBolt,
    nameKey: "signup3PlanStarterName",
    priceKey: "signup3PlanStarterPrice",
    priceSuffixKey: "signup3PlanStarterPriceSuffix",
    taglineKey: "signup3PlanStarterTagline",
    featureKey: "signup3PlanStarterFeature",
  },
  {
    id: "pro",
    icon: IconRocket,
    nameKey: "signup3PlanProName",
    priceKey: "signup3PlanProPrice",
    priceSuffixKey: "signup3PlanProPriceSuffix",
    taglineKey: "signup3PlanProTagline",
    featureKey: "signup3PlanProFeature",
    recommended: true,
  },
  {
    id: "team",
    icon: IconUsers,
    nameKey: "signup3PlanTeamName",
    priceKey: "signup3PlanTeamPrice",
    priceSuffixKey: "signup3PlanTeamPriceSuffix",
    taglineKey: "signup3PlanTeamTagline",
    featureKey: "signup3PlanTeamFeature",
  },
];

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  agreed: boolean,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  if (!agreed) return;
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setSubmitted(true);
  }, 700);
}

export function PlanSelectSignup() {
  const t = useMessages("pages") as unknown as PagesWithSignupMessages;
  const su = t.signup;

  const [plan, setPlan] = useState("pro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    name.length > 0 && email.includes("@") && password.length > 0 && agreed;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">{su.signup3Title}</CardTitle>
            <CardDescription>{su.signup3Description}</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
                  <IconCircleCheck size={20} aria-hidden="true" />
                </span>
                <p className="text-fg text-sm font-medium">
                  {su.signup3SuccessTitle}
                </p>
                <p className="text-muted text-sm">
                  {su.signup3SuccessBody}{" "}
                  <span className="text-fg font-medium">{email}</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setAgreed(false);
                  }}
                >
                  {su.signup3ResetAction}
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(event) =>
                  handleSubmit(event, agreed, setSubmitting, setSubmitted)
                }
                className="flex flex-col gap-6"
              >
                <RadioGroup
                  value={plan}
                  onValueChange={setPlan}
                  aria-label={su.signup3PlanSectionLabel}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {PLANS.map((entry) => {
                    const isSelected = plan === entry.id;
                    return (
                      <label
                        key={entry.id}
                        htmlFor={`signup3-plan-${entry.id}`}
                        className={cn(
                          "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors",
                          isSelected
                            ? "border-brand bg-brand/5 ring-brand ring-1 ring-inset"
                            : "border-border hover:bg-surface-hover",
                        )}
                      >
                        {entry.recommended && (
                          <Badge
                            variant="soft"
                            size="sm"
                            className="absolute -top-2.5 right-3"
                          >
                            {su.signup3RecommendedBadge}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <entry.icon
                            size={18}
                            aria-hidden="true"
                            className="text-fg"
                          />
                          <RadioGroupItem
                            value={entry.id}
                            id={`signup3-plan-${entry.id}`}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-fg text-sm font-semibold">
                            {su[entry.nameKey]}
                          </span>
                          <span className="text-fg text-lg font-semibold">
                            {su[entry.priceKey]}
                            <span className="text-muted text-xs font-normal">
                              {su[entry.priceSuffixKey]}
                            </span>
                          </span>
                          <span className="text-muted text-xs leading-relaxed">
                            {su[entry.taglineKey]}
                          </span>
                        </div>
                        <span className="text-muted text-xs">
                          {su[entry.featureKey]}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 text-left">
                    <Label htmlFor="signup3-name" required>
                      {su.signup3NameLabel}
                    </Label>
                    <Input
                      id="signup3-name"
                      type="text"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={su.signup3NamePlaceholder}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <Label htmlFor="signup3-email" required>
                      {su.signup3EmailLabel}
                    </Label>
                    <Input
                      id="signup3-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={su.signup3EmailPlaceholder}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <Label htmlFor="signup3-password" required>
                    {su.signup3PasswordLabel}
                  </Label>
                  <Input
                    id="signup3-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={su.signup3PasswordPlaceholder}
                  />
                </div>
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="signup3-terms"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    required
                  />
                  <label
                    htmlFor="signup3-terms"
                    className="text-muted text-sm leading-relaxed"
                  >
                    {su.signup3TermsPrefix}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup3TermsAgreement}
                    </a>{" "}
                    {su.signup3TermsAnd}{" "}
                    <a
                      href={LINK_URL}
                      className="text-fg underline underline-offset-4"
                    >
                      {su.signup3TermsPrivacy}
                    </a>
                  </label>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={submitting}
                  disabled={!canSubmit}
                >
                  {su.signup3Submit}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
