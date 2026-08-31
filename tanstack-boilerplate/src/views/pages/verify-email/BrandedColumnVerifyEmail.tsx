"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClock,
  IconLockAccess,
  IconRosetteDiscountCheck,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithVerifyEmailMessages } from "@/types/pages/verify-email/VerifyEmailMessages-types";

const RESEND_COOLDOWN_SECONDS = 30 as const;

const BENEFITS = [
  { icon: IconRosetteDiscountCheck, textKey: "verifyEmail5Benefit1" },
  { icon: IconShieldCheck, textKey: "verifyEmail5Benefit2" },
  { icon: IconLockAccess, textKey: "verifyEmail5Benefit3" },
] as const;

export function BrandedColumnVerifyEmail() {
  const t = useMessages("pages") as unknown as PagesWithVerifyEmailMessages;
  const ve = t.verifyEmail;

  const [resendCooldown, setResendCooldown] = useState<number>(
    RESEND_COOLDOWN_SECONDS,
  );

  // Ticks the resend cooldown down from the moment this screen mounts, driven
  // entirely from setInterval (no synchronous setState as the first
  // statement) so it satisfies react-hooks/set-state-in-effect.
  useEffect(() => {
    const id = setInterval(() => {
      setResendCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const progressValue =
    ((RESEND_COOLDOWN_SECONDS - resendCooldown) / RESEND_COOLDOWN_SECONDS) *
    100;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="border-border bg-bg mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border shadow-md lg:grid lg:grid-cols-2">
        <div className="bg-brand text-brand-fg relative hidden flex-col justify-between gap-10 overflow-hidden p-10 lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--brand-fg) 25%, transparent) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              maskImage:
                "radial-gradient(ellipse 65% 55% at 25% 15%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 55% at 25% 15%, black, transparent)",
            }}
          />
          <span className="border-brand-fg/30 relative flex size-12 items-center justify-center rounded-full border">
            <IconSparkles size={22} aria-hidden="true" />
          </span>
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-medium tracking-tight">
                {ve.verifyEmail5BrandHeading}
              </h2>
              <p className="text-brand-fg/80 text-sm">
                {ve.verifyEmail5BrandBody}
              </p>
            </div>
            <ul className="flex flex-col gap-4">
              {BENEFITS.map((benefit) => (
                <li key={benefit.textKey} className="flex items-center gap-3">
                  <span className="border-brand-fg/30 flex size-8 shrink-0 items-center justify-center rounded-full border">
                    <benefit.icon size={15} aria-hidden="true" />
                  </span>
                  <span className="text-sm">{ve[benefit.textKey]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
          <Link
            href="#"
            className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 text-sm"
          >
            <IconArrowLeft size={14} aria-hidden="true" />
            {ve.verifyEmail5BackToLogin}
          </Link>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-fg text-2xl font-semibold tracking-tight">
              {ve.verifyEmail5Title}
            </h2>
            <p className="text-muted text-sm">
              {ve.verifyEmail5Description}{" "}
              <span className="text-fg font-medium">
                {ve.verifyEmail5MaskedEmail}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Progress value={progressValue} size="sm" />
            {resendCooldown > 0 ? (
              <span className="text-muted flex items-center gap-1.5 text-xs tabular-nums">
                <IconClock size={13} aria-hidden="true" />
                {`${ve.verifyEmail5ResendCountdownLabel} 0:${String(
                  resendCooldown,
                ).padStart(2, "0")}`}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setResendCooldown(RESEND_COOLDOWN_SECONDS)}
                className="text-brand w-fit text-xs font-medium hover:underline"
              >
                {ve.verifyEmail5ResendAction}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
