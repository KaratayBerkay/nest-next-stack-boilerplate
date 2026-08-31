"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconQrcode,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InputOTP } from "@/components/ui/InputOTP";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTwoFactorMessages } from "@/types/pages/two-factor/TwoFactorMessages-types";

const CODE_LENGTH = 6 as const;

// Decorative stand-in for a scanned QR code (not a real encodable payload) —
// same finder-pattern + deterministic-noise technique used by the download
// category's promo QR, sized to a 21x21 grid with 7x7 corner finders.
const QR_SIZE = 21;
const QR_FINDER = 7;
const QR_SEED = 20260831;

const QR_FINDER_ORIGINS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, QR_SIZE - QR_FINDER],
  [QR_SIZE - QR_FINDER, 0],
];

function isQrFinderCell(row: number, col: number): boolean {
  return QR_FINDER_ORIGINS.some(([originRow, originCol]) => {
    const dr = row - originRow;
    const dc = col - originCol;
    if (dr < 0 || dr >= QR_FINDER || dc < 0 || dc >= QR_FINDER) return false;
    const onRing =
      dr === 0 || dr === QR_FINDER - 1 || dc === 0 || dc === QR_FINDER - 1;
    const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    return onRing || inCore;
  });
}

function isQrCellOn(row: number, col: number): boolean {
  if (isQrFinderCell(row, col)) return true;
  const value = Math.sin(row * 12.9898 + col * 78.233 + QR_SEED) * 43758.5453;
  return value - Math.floor(value) > 0.5;
}

type PairingStep = "scan" | "confirm";

function handleConnect(
  event: FormEvent<HTMLFormElement>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  setConnected: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
    setConnected(true);
  }, 700);
}

function handleCopyKey(setCopied: Dispatch<SetStateAction<boolean>>) {
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

function handleReset(
  setStep: Dispatch<SetStateAction<PairingStep>>,
  setCode: Dispatch<SetStateAction<string>>,
  setConnected: Dispatch<SetStateAction<boolean>>,
) {
  setStep("scan");
  setCode("");
  setConnected(false);
}

export function QrPairingTwoFactor() {
  const t = useMessages("pages") as unknown as PagesWithTwoFactorMessages;
  const tf = t.twoFactor;

  const [step, setStep] = useState<PairingStep>("scan");
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);

  const steps = [tf.twoFactor5Step1Label, tf.twoFactor5Step2Label];

  return (
    <section className="flex w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full">
                <IconQrcode size={20} aria-hidden="true" />
              </span>
              <StepIndicator
                steps={steps}
                currentStep={step === "scan" ? 0 : 1}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-fg text-xl font-semibold tracking-tight">
                {tf.twoFactor5Title}
              </h3>
              <p className="text-muted text-sm">{tf.twoFactor5Description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
                <IconShieldCheck size={26} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-fg text-sm font-medium">
                  {tf.twoFactor5SuccessTitle}
                </p>
                <p className="text-muted text-sm">{tf.twoFactor5SuccessBody}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleReset(setStep, setCode, setConnected)}
              >
                {tf.twoFactor5DoneAction}
              </Button>
            </div>
          ) : step === "scan" ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
              <div
                aria-label={tf.twoFactor5QrAlt}
                className="border-border bg-bg flex shrink-0 flex-col rounded-lg border p-3"
              >
                {Array.from({ length: QR_SIZE }, (_, row) => (
                  <div key={row} className="flex">
                    {Array.from({ length: QR_SIZE }, (_, col) => (
                      <span
                        key={col}
                        className={cn(
                          "size-[6px]",
                          isQrCellOn(row, col) && "bg-fg",
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex w-full max-w-[240px] flex-col gap-3">
                <p className="text-fg text-sm font-medium">
                  {tf.twoFactor5ManualKeyLabel}
                </p>
                <div className="border-border bg-surface rounded-md border px-3 py-2">
                  <p className="text-fg font-mono text-sm tracking-wide">
                    {tf.twoFactor5ManualKeyValue}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={
                    copied ? (
                      <IconCheck size={14} aria-hidden="true" />
                    ) : (
                      <IconCopy size={14} aria-hidden="true" />
                    )
                  }
                  onClick={() => handleCopyKey(setCopied)}
                >
                  {copied ? tf.twoFactor5CopiedAction : tf.twoFactor5CopyAction}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setStep("confirm")}
                >
                  {tf.twoFactor5ContinueAction}
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(event) =>
                handleConnect(event, setSubmitting, setConnected)
              }
              className="flex flex-col items-center gap-5"
            >
              <button
                type="button"
                onClick={() => setStep("scan")}
                className="text-muted hover:text-fg inline-flex w-fit items-center gap-1.5 self-start text-xs"
              >
                <IconArrowLeft size={12} aria-hidden="true" />
                {tf.twoFactor5BackAction}
              </button>
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-fg text-sm font-medium">
                  {tf.twoFactor5ConfirmCodeLabel}
                </p>
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={CODE_LENGTH}
                />
                <p className="text-muted text-xs">
                  {tf.twoFactor5ConfirmCodeHint}
                </p>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full max-w-xs"
                loading={submitting}
                disabled={code.length !== CODE_LENGTH}
              >
                {tf.twoFactor5VerifyAction}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
