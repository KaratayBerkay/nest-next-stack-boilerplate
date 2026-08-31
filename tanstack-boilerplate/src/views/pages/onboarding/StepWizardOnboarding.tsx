"use client";

import { useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconCheck,
  IconChartBar,
  IconMessageCircle,
  IconPlugConnected,
  IconRocket,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CheckboxCard } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOnboardingMessages } from "@/types/pages/onboarding/OnboardingMessages-types";

const TOTAL_STEPS = 4;

const TEAM_SIZES = [
  { value: "solo", labelKey: "onboarding1TeamSize1" },
  { value: "small", labelKey: "onboarding1TeamSize2" },
  { value: "medium", labelKey: "onboarding1TeamSize3" },
  { value: "large", labelKey: "onboarding1TeamSize4" },
] as const;

const FOCUS_AREAS = [
  {
    id: "roadmap",
    icon: IconRocket,
    titleKey: "onboarding1Focus1Title",
    descKey: "onboarding1Focus1Desc",
  },
  {
    id: "chat",
    icon: IconMessageCircle,
    titleKey: "onboarding1Focus2Title",
    descKey: "onboarding1Focus2Desc",
  },
  {
    id: "analytics",
    icon: IconChartBar,
    titleKey: "onboarding1Focus3Title",
    descKey: "onboarding1Focus3Desc",
  },
  {
    id: "integrations",
    icon: IconPlugConnected,
    titleKey: "onboarding1Focus4Title",
    descKey: "onboarding1Focus4Desc",
  },
] as const;

export function StepWizardOnboarding() {
  const t = useMessages("pages") as unknown as PagesWithOnboardingMessages;
  const ob = t.onboarding;

  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [teamSize, setTeamSize] = useState<string>(TEAM_SIZES[1].value);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState<string[]>([]);

  const steps = [
    ob.onboarding1Step1Label,
    ob.onboarding1Step2Label,
    ob.onboarding1Step3Label,
    ob.onboarding1Step4Label,
  ];
  const teamSizeLabel = TEAM_SIZES.find((size) => size.value === teamSize)?.labelKey;
  const previewName = workspaceName.trim() || ob.onboarding1PreviewNamePlaceholder;

  function toggleFocus(id: string) {
    setFocusAreas((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function addInvite() {
    const trimmed = email.trim();
    if (!trimmed || invited.includes(trimmed)) return;
    setInvited((current) => [...current, trimmed]);
    setEmail("");
  }

  function removeInvite(target: string) {
    setInvited((current) => current.filter((item) => item !== target));
  }

  function reset() {
    setStep(1);
    setWorkspaceName("");
    setTeamSize(TEAM_SIZES[1].value);
    setFocusAreas([]);
    setEmail("");
    setInvited([]);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="border-border bg-surface grid overflow-hidden rounded-2xl border lg:grid-cols-[0.9fr_1.3fr]">
          <div className="bg-muted/40 border-border flex flex-col gap-5 border-b p-8 lg:border-r lg:border-b-0">
            <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
              <IconBriefcase size={18} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs font-medium tracking-wide uppercase">
                {ob.onboarding1PreviewLabel}
              </span>
              <span className="text-fg text-lg font-semibold break-words">{previewName}</span>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{ob.onboarding1TeamSizeLabel}</span>
                <span className="text-fg font-medium">{teamSizeLabel ? ob[teamSizeLabel] : ""}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{ob.onboarding1Step2Label}</span>
                <span className="text-fg font-medium">{focusAreas.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{ob.onboarding1Step3Label}</span>
                <span className="text-fg font-medium">{invited.length}</span>
              </div>
            </div>
            {invited.length > 0 && (
              <AvatarGroup size="sm">
                {invited.map((item) => (
                  <Avatar key={item} fallback={item} size="sm" />
                ))}
              </AvatarGroup>
            )}
          </div>

          <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-3">
              <StepIndicator steps={steps} currentStep={step - 1} onChange={(index) => setStep(index + 1)} />
              <Progress value={(step / TOTAL_STEPS) * 100} size="sm" />
            </div>

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-fg text-lg font-semibold">{ob.onboarding1Step1Title}</h3>
                  <p className="text-muted text-sm">{ob.onboarding1Step1Subtitle}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="onboarding1-name">{ob.onboarding1WorkspaceNameLabel}</Label>
                  <Input
                    id="onboarding1-name"
                    type="text"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    placeholder={ob.onboarding1WorkspaceNamePlaceholder}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-fg text-sm font-medium">{ob.onboarding1TeamSizeLabel}</span>
                  <RadioGroup value={teamSize} onValueChange={setTeamSize} className="grid grid-cols-2 gap-2">
                    {TEAM_SIZES.map((size) => (
                      <label
                        key={size.value}
                        htmlFor={`onboarding1-size-${size.value}`}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2 rounded-lg border p-2.5"
                      >
                        <RadioGroupItem value={size.value} id={`onboarding1-size-${size.value}`} />
                        <span className="text-sm">{ob[size.labelKey]}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-fg text-lg font-semibold">{ob.onboarding1Step2Title}</h3>
                  <p className="text-muted text-sm">{ob.onboarding1Step2Subtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {FOCUS_AREAS.map((area) => (
                    <CheckboxCard
                      key={area.id}
                      icon={<area.icon size={18} aria-hidden="true" />}
                      title={ob[area.titleKey]}
                      description={ob[area.descKey]}
                      checked={focusAreas.includes(area.id)}
                      onChange={() => toggleFocus(area.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-fg text-lg font-semibold">{ob.onboarding1Step3Title}</h3>
                  <p className="text-muted text-sm">{ob.onboarding1Step3Subtitle}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="onboarding1-email">{ob.onboarding1EmailLabel}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="onboarding1-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={ob.onboarding1EmailPlaceholder}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<IconUserPlus size={16} aria-hidden="true" />}
                      disabled={!email.trim()}
                      onClick={addInvite}
                    >
                      {ob.onboarding1AddAction}
                    </Button>
                  </div>
                </div>
                {invited.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {invited.map((item) => (
                      <li
                        key={item}
                        className="border-border bg-bg flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <Avatar fallback={item} size="sm" />
                          {item}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInvite(item)}
                          aria-label={`${ob.onboarding1RemoveInviteAria} ${item}`}
                          className="text-muted hover:text-fg"
                        >
                          <IconX size={14} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <span className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
                  <IconCheck size={22} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-fg text-lg font-semibold">{ob.onboarding1Step4Title}</h3>
                  <p className="text-muted text-sm">{ob.onboarding1Step4Body}</p>
                </div>
                <ul className="text-fg flex w-full flex-col gap-2 text-left text-sm">
                  <li className="border-border rounded-lg border px-3 py-2">
                    {ob.onboarding1SummaryWorkspace.replace("{name}", previewName)}
                  </li>
                  <li className="border-border rounded-lg border px-3 py-2">
                    {ob.onboarding1SummaryTeamSize.replace(
                      "{size}",
                      teamSizeLabel ? ob[teamSizeLabel] : "",
                    )}
                  </li>
                  <li className="border-border rounded-lg border px-3 py-2">
                    {ob.onboarding1SummaryFocus.replace("{count}", String(focusAreas.length))}
                  </li>
                  <li className="border-border rounded-lg border px-3 py-2">
                    {ob.onboarding1SummaryInvites.replace("{count}", String(invited.length))}
                  </li>
                </ul>
                <Button type="button" variant="outline" size="sm" onClick={reset}>
                  {ob.onboarding1StartOver}
                </Button>
              </div>
            )}

            {step < 4 && (
              <div className="mt-auto flex justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={step === 1}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                >
                  <IconArrowLeft size={16} aria-hidden="true" />
                  {ob.onboarding1Back}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                >
                  {step === TOTAL_STEPS - 1 ? ob.onboarding1Finish : ob.onboarding1Next}
                  <IconArrowRight size={16} aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
