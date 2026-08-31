"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconCircleCheck,
  IconMailOpened,
  IconRefresh,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithVerifyEmailMessages } from "@/types/pages/verify-email/VerifyEmailMessages-types";

type VerifyStatus = "waiting" | "verified";

const AUTO_VERIFY_DELAY_MS = 6000 as const;

function handleResend(setResent: Dispatch<SetStateAction<boolean>>) {
  setResent(true);
  setTimeout(() => setResent(false), 2000);
}

function handleStartOver(setStatus: Dispatch<SetStateAction<VerifyStatus>>) {
  setStatus("waiting");
}

export function AutoDetectVerifyEmail() {
  const t = useMessages("pages") as unknown as PagesWithVerifyEmailMessages;
  const ve = t.verifyEmail;

  const [status, setStatus] = useState<VerifyStatus>("waiting");
  const [resent, setResent] = useState(false);

  // Simulates detecting that the visitor opened the link in another tab —
  // arms a one-shot timer whenever we re-enter the "waiting" state, entirely
  // from the timer callback (no synchronous setState as the first statement)
  // so it satisfies react-hooks/set-state-in-effect.
  useEffect(() => {
    if (status !== "waiting") return;
    const id = setTimeout(() => setStatus("verified"), AUTO_VERIFY_DELAY_MS);
    return () => clearTimeout(id);
  }, [status]);

  return (
    <section className="flex min-h-[560px] w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="items-center gap-4 text-center">
          {status === "waiting" ? (
            <span className="relative flex size-14 items-center justify-center">
              <span className="bg-brand/10 text-brand flex size-14 items-center justify-center rounded-full">
                <IconMailOpened size={26} aria-hidden="true" />
              </span>
              <span className="ring-bg absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full ring-2">
                <span className="bg-brand/60 absolute inline-flex size-4 animate-ping rounded-full" />
                <span className="bg-brand relative inline-flex size-2.5 rounded-full" />
              </span>
            </span>
          ) : (
            <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
              <IconRosetteDiscountCheck size={26} aria-hidden="true" />
            </span>
          )}
          <div className="flex flex-col gap-1.5">
            {status === "waiting" ? (
              <span className="bg-brand/10 text-brand mx-auto inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                {ve.verifyEmail3StatusBadge}
              </span>
            ) : null}
            <CardTitle className="text-xl">
              {status === "waiting"
                ? ve.verifyEmail3Title
                : ve.verifyEmail3SuccessTitle}
            </CardTitle>
            <CardDescription>
              {status === "waiting" ? (
                <>
                  {ve.verifyEmail3Description}{" "}
                  <span className="text-fg font-medium">
                    {ve.verifyEmail3MaskedEmail}
                  </span>
                </>
              ) : (
                ve.verifyEmail3SuccessBody
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {status === "waiting" ? (
            <div className="flex flex-col items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<IconCircleCheck size={15} aria-hidden="true" />}
                onClick={() => setStatus("verified")}
              >
                {ve.verifyEmail3ManualConfirmAction}
              </Button>

              {resent ? (
                <p className="text-success flex items-center gap-1.5 text-xs">
                  <IconCircleCheck size={13} aria-hidden="true" />
                  {ve.verifyEmail3ResendConfirmed}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleResend(setResent)}
                  className="text-brand inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
                >
                  <IconRefresh size={13} aria-hidden="true" />
                  {ve.verifyEmail3ResendAction}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStartOver(setStatus)}
              >
                {ve.verifyEmail3StartOverAction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
