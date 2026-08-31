"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCircleCheck,
  IconMailCheck,
  IconMailOpened,
  IconRefresh,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithVerifyEmailMessages } from "@/types/pages/verify-email/VerifyEmailMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const STEPS = [
  { number: 1, textKey: "verifyEmail2Step1" },
  { number: 2, textKey: "verifyEmail2Step2" },
  { number: 3, textKey: "verifyEmail2Step3" },
] as const;

function handleResend(setResent: Dispatch<SetStateAction<boolean>>) {
  setResent(true);
  setTimeout(() => setResent(false), 2000);
}

export function SplitImageChecklistVerifyEmail() {
  const t = useMessages("pages") as unknown as PagesWithVerifyEmailMessages;
  const ve = t.verifyEmail;

  const [resent, setResent] = useState(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:px-8">
        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <Image
            src={placeholderImage("verify-email-2-hero", "3x4")}
            alt={ve.verifyEmail2ImageAlt}
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <Badge
            variant="soft"
            size="sm"
            className="absolute top-6 left-6 gap-1.5 backdrop-blur"
          >
            <IconMailOpened size={14} aria-hidden="true" />
            {ve.verifyEmail2StepBadge}
          </Badge>
        </div>

        <div className="flex flex-col justify-center gap-6 py-4 lg:py-0 lg:pl-16">
          <Link
            href="#"
            className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {ve.verifyEmail2BackToLogin}
          </Link>

          <div className="flex flex-col gap-4">
            <span className="bg-success/10 text-success flex size-11 items-center justify-center rounded-full">
              <IconMailCheck size={20} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-fg text-2xl font-semibold tracking-tight">
                {ve.verifyEmail2Title}
              </h2>
              <p className="text-muted text-sm">
                {ve.verifyEmail2Description}{" "}
                <span className="text-fg font-medium">
                  {ve.verifyEmail2MaskedEmail}
                </span>
              </p>
            </div>
          </div>

          <ol className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <li key={step.textKey} className="flex items-start gap-3">
                <span className="bg-brand/10 text-brand flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {step.number}
                </span>
                <span className="text-fg pt-0.5 text-sm">
                  {ve[step.textKey]}
                </span>
              </li>
            ))}
          </ol>

          {resent ? (
            <p className="text-success flex items-center gap-1.5 text-sm">
              <IconCircleCheck size={14} aria-hidden="true" />
              {ve.verifyEmail2ResendConfirmed}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => handleResend(setResent)}
              className="text-brand inline-flex w-fit items-center gap-1.5 text-sm font-medium hover:underline"
            >
              <IconRefresh size={14} aria-hidden="true" />
              {ve.verifyEmail2ResendAction}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
