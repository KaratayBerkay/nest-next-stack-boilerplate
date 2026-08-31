"use client";

import { useEffect, useState } from "react";
import { IconChevronDown, IconClock, IconMailCheck } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithVerifyEmailMessages } from "@/types/pages/verify-email/VerifyEmailMessages-types";

const RESEND_COOLDOWN_SECONDS = 30 as const;

const TIPS = [
  { qKey: "verifyEmail4Tip1Q", aKey: "verifyEmail4Tip1A" },
  { qKey: "verifyEmail4Tip2Q", aKey: "verifyEmail4Tip2A" },
  { qKey: "verifyEmail4Tip3Q", aKey: "verifyEmail4Tip3A" },
  { qKey: "verifyEmail4Tip4Q", aKey: "verifyEmail4Tip4A" },
] as const;

export function MutedTroubleshootingVerifyEmail() {
  const t = useMessages("pages") as unknown as PagesWithVerifyEmailMessages;
  const ve = t.verifyEmail;

  const [resendCooldown, setResendCooldown] = useState<number>(
    RESEND_COOLDOWN_SECONDS,
  );

  // Ticks the resend cooldown down from the moment this panel mounts, driven
  // entirely from setInterval (no synchronous setState as the first
  // statement) so it satisfies react-hooks/set-state-in-effect.
  useEffect(() => {
    const id = setInterval(() => {
      setResendCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-muted/50 w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-6 lg:px-8">
        <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
          <IconMailCheck size={22} aria-hidden="true" />
        </span>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-fg text-2xl font-semibold tracking-tight">
            {ve.verifyEmail4Title}
          </h2>
          <p className="text-muted text-sm">
            {ve.verifyEmail4Description}{" "}
            <span className="text-fg font-medium">
              {ve.verifyEmail4MaskedEmail}
            </span>
          </p>
        </div>

        {resendCooldown > 0 ? (
          <p className="text-muted flex items-center gap-1.5 text-xs">
            <IconClock size={13} aria-hidden="true" />
            {`${ve.verifyEmail4ResendCountdownLabel} 0:${String(
              resendCooldown,
            ).padStart(2, "0")}`}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setResendCooldown(RESEND_COOLDOWN_SECONDS)}
            className="text-brand text-sm font-medium hover:underline"
          >
            {ve.verifyEmail4ResendAction}
          </button>
        )}

        <Separator label={ve.verifyEmail4HelpDivider} className="w-full" />

        <Accordion type="single" collapsible className="w-full">
          {TIPS.map((tip) => (
            <AccordionItem key={tip.qKey} value={tip.qKey}>
              <AccordionTrigger>
                <span>{ve[tip.qKey]}</span>
                <IconChevronDown
                  size={16}
                  className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                />
              </AccordionTrigger>
              <AccordionContent>{ve[tip.aKey]}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
