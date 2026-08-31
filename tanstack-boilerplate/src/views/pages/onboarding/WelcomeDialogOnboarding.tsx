"use client";

import { useState } from "react";
import Image from "next/image";
import { IconArrowLeft, IconArrowRight, IconCircleCheck, IconRocket } from "@tabler/icons-react";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithOnboardingMessages } from "@/types/pages/onboarding/OnboardingMessages-types";

const TOTAL_STEPS = 4;

const ROLES = [
  { value: "founder", labelKey: "onboarding2Role1" },
  { value: "engineer", labelKey: "onboarding2Role2" },
  { value: "designer", labelKey: "onboarding2Role3" },
  { value: "marketer", labelKey: "onboarding2Role4" },
] as const;

const PREFS = [
  { id: "updates", labelKey: "onboarding2Pref1Label" },
  { id: "digest", labelKey: "onboarding2Pref2Label" },
  { id: "tips", labelKey: "onboarding2Pref3Label" },
] as const;

export function WelcomeDialogOnboarding() {
  const t = useMessages("pages") as unknown as PagesWithOnboardingMessages;
  const ob = t.onboarding;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    updates: true,
    digest: false,
    tips: true,
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Delay the reset past the ~150ms close animation so the dialog
      // doesn't visibly flash back to step 1 while it's still fading out.
      setTimeout(() => setStep(1), 200);
    }
  }

  const roleLabel = ROLES.find((item) => item.value === role)?.labelKey;
  const prefCount = Object.values(prefs).filter(Boolean).length;

  const stepTitles = [
    ob.onboarding2Step1Title,
    ob.onboarding2Step2Title,
    ob.onboarding2Step3Title,
    ob.onboarding2Step4Title,
  ];
  const stepBodies = [
    ob.onboarding2Step1Body,
    ob.onboarding2Step2Body,
    ob.onboarding2Step3Body,
    ob.onboarding2Step4Body,
  ];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
          <span className="bg-brand/10 text-brand flex size-14 items-center justify-center rounded-full">
            <IconRocket size={26} aria-hidden="true" />
          </span>
          <h2 className="text-fg text-2xl font-semibold">{ob.onboarding2Heading}</h2>
          <p className="text-muted max-w-sm text-sm">{ob.onboarding2Subheading}</p>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger variant="primary" size="lg">
              {ob.onboarding2Trigger}
            </DialogTrigger>
            <DialogContent size="md">
              <DialogHeader>
                <span className="sr-only">
                  {ob.onboarding2StepLabel
                    .replace("{n}", String(step))
                    .replace("{total}", String(TOTAL_STEPS))}
                </span>
                <DialogTitle>{stepTitles[step - 1]}</DialogTitle>
                <DialogDescription>{stepBodies[step - 1]}</DialogDescription>
              </DialogHeader>

              <DialogBody>
                {step === 1 && (
                  <AspectRatio ratio={2 / 1} className="bg-surface rounded-xl">
                    <Image
                      src={placeholderImage("onboarding2-welcome", "2x1")}
                      alt={ob.onboarding2WelcomeImageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 480px"
                      className="object-cover"
                    />
                  </AspectRatio>
                )}

                {step === 2 && (
                  <RadioGroup value={role} onValueChange={setRole} className="flex flex-col gap-2.5">
                    {ROLES.map((item) => (
                      <label
                        key={item.value}
                        htmlFor={`onboarding2-role-${item.value}`}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                      >
                        <RadioGroupItem value={item.value} id={`onboarding2-role-${item.value}`} />
                        <span className="text-sm">{ob[item.labelKey]}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-2.5">
                    {PREFS.map((pref) => (
                      <div
                        key={pref.id}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border rounded-lg border p-3"
                      >
                        <Checkbox
                          id={`onboarding2-pref-${pref.id}`}
                          label={ob[pref.labelKey]}
                          checked={prefs[pref.id] ?? false}
                          onChange={(event) =>
                            setPrefs((current) => ({ ...current, [pref.id]: event.target.checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center gap-3 py-2 text-center">
                    <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
                      <IconCircleCheck size={26} aria-hidden="true" />
                    </span>
                    <ul className="text-fg flex w-full flex-col gap-2 text-left text-sm">
                      <li className="border-border rounded-lg border px-3 py-2">
                        {ob.onboarding2SummaryRole.replace("{role}", roleLabel ? ob[roleLabel] : "")}
                      </li>
                      <li className="border-border rounded-lg border px-3 py-2">
                        {ob.onboarding2SummaryPrefs.replace("{count}", String(prefCount))}
                      </li>
                    </ul>
                  </div>
                )}
              </DialogBody>

              <DialogFooter>
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    {[1, 2, 3, 4].map((dot) => (
                      <span
                        key={dot}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          dot === step ? "bg-brand w-6" : "bg-border w-1.5",
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {step > 1 && step < TOTAL_STEPS && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                      >
                        <IconArrowLeft size={16} aria-hidden="true" />
                        {ob.onboarding2Back}
                      </Button>
                    )}
                    {step < TOTAL_STEPS && (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                      >
                        {ob.onboarding2Next}
                        <IconArrowRight size={16} aria-hidden="true" />
                      </Button>
                    )}
                    {step === TOTAL_STEPS && (
                      <DialogClose variant="primary">{ob.onboarding2Finish}</DialogClose>
                    )}
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <span className="text-muted text-xs">{ob.onboarding2Hint}</span>
        </div>
      </div>
    </section>
  );
}
