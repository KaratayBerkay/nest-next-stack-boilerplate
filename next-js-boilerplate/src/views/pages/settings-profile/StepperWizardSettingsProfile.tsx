"use client";

import { useState } from "react";
import { IconCircleCheck } from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";
import type { UploadFile, FileUploadLabels } from "@/types/ui/FileUpload-types";

interface WizardValues {
  name: string;
  username: string;
  bio: string;
  location: string;
}

const LAST_STEP = 3;

export function StepperWizardSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const initialValues: WizardValues = {
    name: sp.settingsProfile9NameValue,
    username: sp.settingsProfile9UsernameValue,
    bio: sp.settingsProfile9BioValue,
    location: sp.settingsProfile9LocationValue,
  };

  const [values, setValues] = useState<WizardValues>(initialValues);
  const [avatar, setAvatar] = useState<UploadFile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [completed, setCompleted] = useState(false);

  const stepLabels = [
    sp.settingsProfile9Step1,
    sp.settingsProfile9Step2,
    sp.settingsProfile9Step3,
    sp.settingsProfile9Step4,
  ];

  const uploadLabels: FileUploadLabels = {
    changePhoto: sp.settingsProfile9ChangePhoto,
    removePhoto: sp.settingsProfile9RemovePhoto,
    uploading: sp.settingsProfile9Uploading,
    uploadFailed: sp.settingsProfile9UploadFailed,
    invalidTypeTitle: sp.settingsProfile9InvalidTypeTitle,
    invalidType: (file, accepted) =>
      sp.settingsProfile9InvalidType
        .replace("{file}", file)
        .replace("{accepted}", accepted),
    acceptedTypesText: (accept) =>
      sp.settingsProfile9AcceptedTypes.replace("{accept}", accept),
  };

  function updateField<K extends keyof WizardValues>(
    key: K,
    value: WizardValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    setMaxReached((m) => Math.max(m, currentStep + 1));
    setCurrentStep((s) => Math.min(s + 1, LAST_STEP));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleStepChange(index: number) {
    if (index <= maxReached) setCurrentStep(index);
  }

  function handleFinish() {
    setCompleted(true);
  }

  function handleStartOver() {
    setValues(initialValues);
    setAvatar([]);
    setCurrentStep(0);
    setMaxReached(0);
    setCompleted(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <StepIndicator
              steps={stepLabels}
              currentStep={currentStep}
              onChange={handleStepChange}
            />
          </CardHeader>

          <CardContent className="min-h-64">
            {completed ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <IconCircleCheck
                  size={40}
                  className="text-success"
                  aria-hidden="true"
                />
                <h3 className="text-fg text-lg font-semibold">
                  {sp.settingsProfile9CompletedHeading}
                </h3>
                <p className="text-muted text-sm">
                  {sp.settingsProfile9CompletedText}
                </p>
              </div>
            ) : (
              <>
                {currentStep === 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sw-name">
                        {sp.settingsProfile9NameLabel}
                      </Label>
                      <Input
                        id="sw-name"
                        value={values.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sw-username">
                        {sp.settingsProfile9UsernameLabel}
                      </Label>
                      <Input
                        id="sw-username"
                        value={values.username}
                        onChange={(e) =>
                          updateField("username", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <p className="text-muted text-sm">
                      {sp.settingsProfile9PhotoStepHint}
                    </p>
                    <ImageUpload
                      avatar
                      value={avatar}
                      onChange={setAvatar}
                      labels={uploadLabels}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sw-bio">
                        {sp.settingsProfile9BioLabel}
                      </Label>
                      <Textarea
                        id="sw-bio"
                        rows={3}
                        value={values.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="sw-location">
                        {sp.settingsProfile9LocationLabel}
                      </Label>
                      <Input
                        id="sw-location"
                        value={values.location}
                        onChange={(e) =>
                          updateField("location", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-fg text-sm font-semibold">
                      {sp.settingsProfile9ReviewHeading}
                    </h3>
                    <div className="flex items-center gap-4">
                      {avatar[0]?.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- blob:// URL from file input, next/image doesn't support
                        <img
                          src={avatar[0].preview}
                          alt=""
                          className="size-16 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <Avatar fallback={values.name || "?"} size="lg" />
                      )}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-fg text-base font-semibold">
                          {values.name}
                        </span>
                        <span className="text-muted text-sm">
                          @{values.username}
                        </span>
                        {values.location && (
                          <span className="text-muted text-xs">
                            {values.location}
                          </span>
                        )}
                      </div>
                    </div>
                    {values.bio && (
                      <p className="text-muted text-sm">{values.bio}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter>
            {completed ? (
              <Button
                variant="outline"
                className="mx-auto"
                onClick={handleStartOver}
              >
                {sp.settingsProfile9StartOverButton}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  disabled={currentStep === 0}
                  onClick={handleBack}
                >
                  {sp.settingsProfile9BackButton}
                </Button>
                {currentStep < LAST_STEP ? (
                  <Button variant="primary" onClick={handleNext}>
                    {sp.settingsProfile9NextButton}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleFinish}>
                    {sp.settingsProfile9FinishButton}
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
