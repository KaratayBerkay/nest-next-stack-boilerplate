"use client";

import { useState } from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeedbackMessages } from "@/types/pages/feedback/FeedbackMessages-types";

const STARS = [
  { value: 1, ariaKey: "feedback2Star1Aria" },
  { value: 2, ariaKey: "feedback2Star2Aria" },
  { value: 3, ariaKey: "feedback2Star3Aria" },
  { value: 4, ariaKey: "feedback2Star4Aria" },
  { value: 5, ariaKey: "feedback2Star5Aria" },
] as const;
const REASONS = [
  { value: "pricing", labelKey: "feedback2Reason1" },
  { value: "features", labelKey: "feedback2Reason2" },
  { value: "support", labelKey: "feedback2Reason3" },
] as const;
const TOTAL_STEPS = 3;

export function MultiStepSurvey() {
  const t = useMessages("pages") as unknown as PagesWithFeedbackMessages;
  const fb = t.feedback;
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [reason, setReason] = useState("");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-lg px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col gap-6 rounded-2xl border p-8">
          <div className="flex flex-col gap-2">
            <div className="text-muted flex justify-between text-xs">
              <span>{fb.feedback2StepLabel.replace("{n}", String(step)).replace("{total}", String(TOTAL_STEPS))}</span>
            </div>
            <Progress value={(step / TOTAL_STEPS) * 100} />
          </div>

          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-fg text-lg font-semibold">{fb.feedback2Step1Title}</h3>
              <div className="flex gap-1">
                {STARS.map((star) => (
                  <button
                    key={star.value}
                    type="button"
                    onClick={() => setRating(star.value)}
                    aria-label={fb[star.ariaKey]}
                    className="text-brand p-1"
                  >
                    {star.value <= rating ? (
                      <IconStarFilled size={26} aria-hidden="true" />
                    ) : (
                      <IconStar size={26} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-fg text-lg font-semibold">{fb.feedback2Step2Title}</h3>
              <RadioGroup value={reason} onValueChange={setReason} className="flex flex-col gap-2.5">
                {REASONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`feedback2-${option.value}`}
                    className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                  >
                    <RadioGroupItem value={option.value} id={`feedback2-${option.value}`} />
                    <span className="text-sm">{fb[option.labelKey]}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-fg text-lg font-semibold">{fb.feedback2Step3Title}</h3>
              <Textarea placeholder={fb.feedback2Step3Placeholder} rows={4} />
            </div>
          ) : null}

          <div className="flex justify-between gap-3">
            <Button
              variant="ghost"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              {fb.feedback2Back}
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
            >
              {step === TOTAL_STEPS ? fb.feedback2Submit : fb.feedback2Next}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
