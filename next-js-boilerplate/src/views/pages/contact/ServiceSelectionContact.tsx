"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconChartBar,
  IconCheck,
  IconHeadset,
  IconNews,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface Service {
  id: string;
  title: string;
  descriptionKey: string;
  icon: Icon;
}

const SERVICES: Service[] = [
  {
    id: "sales",
    title: "Sales",
    descriptionKey: "contact29ServiceSalesDescription",
    icon: IconChartBar,
  },
  {
    id: "support",
    title: "Support",
    descriptionKey: "contact29ServiceSupportDescription",
    icon: IconHeadset,
  },
  {
    id: "billing",
    title: "Billing",
    descriptionKey: "contact29ServiceBillingDescription",
    icon: IconReceipt,
  },
  {
    id: "partnerships",
    title: "Partnerships",
    descriptionKey: "contact29ServicePartnershipsDescription",
    icon: IconUsers,
  },
  {
    id: "press",
    title: "Press",
    descriptionKey: "contact29ServicePressDescription",
    icon: IconNews,
  },
];

type Stage = "services" | "form" | "success";

function handleServiceSelect(
  id: string,
  setSelected: Dispatch<SetStateAction<string | null>>,
) {
  setSelected(id);
}

function handleContinue(
  selected: string | null,
  setStage: Dispatch<SetStateAction<Stage>>,
) {
  if (!selected) return;
  setStage("form");
}

function handleBack(setStage: Dispatch<SetStateAction<Stage>>) {
  setStage("services");
}

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

function handleStartOver(
  setStage: Dispatch<SetStateAction<Stage>>,
  setSelected: Dispatch<SetStateAction<string | null>>,
) {
  setStage("services");
  setSelected(null);
}

export function ServiceSelectionContact() {
  const m = useMessages("pages") as unknown as {
    contact: Record<string, string>;
  };
  const co = m.contact;
  const [selected, setSelected] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("services");

  if (stage === "success") {
    return (
      <section className="w-full py-16 lg:py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center lg:px-8">
          <div className="bg-brand/10 text-brand mb-6 flex size-16 items-center justify-center rounded-full">
            <IconCheck size={28} />
          </div>
          <Typography
            variant="h2"
            className="text-4xl font-medium tracking-tighter"
          >
            {co.contact29SuccessTitle}
          </Typography>
          <Typography variant="body" className="text-muted mt-3">
            {co.contact29SuccessDescription}
          </Typography>
          <Button
            variant="primary"
            className="mt-8 rounded-full"
            onClick={() => handleStartOver(setStage, setSelected)}
          >
            {co.contact29SuccessButtonLabel}
          </Button>
        </div>
      </section>
    );
  }

  if (stage === "form") {
    return (
      <section className="w-full py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="flex flex-col gap-4 lg:pt-4">
            <Typography
              variant="h2"
              className="text-4xl font-medium tracking-tighter"
            >
              {co.contact29FormTitle}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {co.contact29FormDescription}
            </Typography>
          </div>
          <form
            onSubmit={handleSubmit}
            className="border-border bg-surface flex h-fit flex-col gap-4 rounded-3xl border p-6 shadow-sm lg:p-8"
          >
            <div className="border-border bg-surface-hover flex items-center justify-between rounded-2xl border p-4">
              <div className="flex flex-col gap-1">
                <Typography
                  variant="caption"
                  className="tracking-wider uppercase"
                >
                  {co.contact29FormSelectedServiceLabel}
                </Typography>
                <span className="text-sm font-medium">
                  {SERVICES.find((service) => service.id === selected)?.title}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-sm"
                onClick={() => handleBack(setStage)}
              >
                {co.contact29FormChangeServiceLabel}
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact29-name">
                {co.contact29FormNameLabel}
              </Label>
              <Input
                id="contact29-name"
                type="text"
                required
                placeholder={co.contact29FormNamePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact29-email">
                {co.contact29FormEmailLabel}
              </Label>
              <Input
                id="contact29-email"
                type="email"
                required
                placeholder={co.contact29FormEmailPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact29-company" className="text-muted">
                {co.contact29FormCompanyLabel}
              </Label>
              <Input
                id="contact29-company"
                type="text"
                placeholder={co.contact29FormCompanyPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact29-message">
                {co.contact29FormMessageLabel}
              </Label>
              <Textarea
                id="contact29-message"
                required
                placeholder={co.contact29FormMessagePlaceholder}
                rows={4}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="mt-2 w-full rounded-full"
            >
              {co.contact29SubmitLabel}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center lg:px-8">
        <Typography
          variant="h2"
          className="text-4xl font-medium tracking-tighter md:text-5xl"
        >
          {co.contact29Title}
        </Typography>
        <Typography variant="bodyLarge" className="text-muted mt-4 max-w-2xl">
          {co.contact29Description}
        </Typography>
        <div className="mt-12 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((service) => {
            const isSelected = selected === service.id;
            return (
              <button
                key={service.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleServiceSelect(service.id, setSelected)}
                className={`flex flex-col items-center gap-3 rounded-3xl border p-6 text-center transition-all ${
                  isSelected
                    ? "border-brand bg-brand/5 ring-brand shadow-md ring-2"
                    : "border-border bg-surface hover:bg-surface-hover shadow-sm"
                }`}
              >
                <span
                  className={`flex size-14 items-center justify-center rounded-full ${
                    isSelected
                      ? "bg-brand text-brand-fg"
                      : "bg-surface-hover text-brand"
                  }`}
                >
                  <service.icon size={24} />
                </span>
                <span className="text-base font-medium">{service.title}</span>
                <span className="text-muted text-sm">
                  {co[service.descriptionKey]}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          variant="primary"
          className="mt-10 rounded-full"
          disabled={!selected}
          onClick={() => handleContinue(selected, setStage)}
        >
          {co.contact29ContinueLabel}
        </Button>
      </div>
    </section>
  );
}
