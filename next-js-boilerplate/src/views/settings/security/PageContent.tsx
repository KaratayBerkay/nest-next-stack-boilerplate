"use client";

import { useCallback, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAuthActions } from "@/api/client/auth/actions";
import type { EnrollMfaResult, VerifyMfaResult } from "@/api/server/auth/mfa";
import { handleEnroll, handleVerify, handleDisable } from "./mfa-handlers";

type Step = "idle" | "qr-code" | "verify" | "backup-codes";

export default function SecurityPageContent() {
  const t = useMessages("settings");
  const { enrollMfa, verifyMfaEnrollment, disableMfa } = useAuthActions();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [enrollData, setEnrollData] = useState<EnrollMfaResult | null>(null);
  const [verifyData, setVerifyData] = useState<VerifyMfaResult | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [codesSaved, setCodesSaved] = useState(false);
  const [showDisableInput, setShowDisableInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onEnroll = useCallback(
    () => handleEnroll(enrollMfa, setEnrollData, setError, setStep),
    [enrollMfa],
  );
  const onVerify = useCallback(
    () =>
      handleVerify(
        verifyCode,
        verifyMfaEnrollment,
        setVerifyData,
        setError,
        setStep,
      ),
    [verifyCode, verifyMfaEnrollment],
  );
  const onDisable = useCallback(
    () =>
      handleDisable(
        disableCode,
        disableMfa,
        () => {
          setMfaEnabled(false);
          setShowDisableInput(false);
          setDisableCode("");
        },
        setError,
      ),
    [disableCode, disableMfa],
  );

  if (step !== "idle" && enrollData) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        {step === "qr-code" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">
              {t.securitySetupTwoFactor}
            </h2>
            <p className="text-muted text-sm">{t.securityScanQrDescription}</p>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(enrollData.otpauthUrl)}`}
                alt="QR Code"
                className="rounded-lg"
                width={240}
                height={240}
              />
            </div>
            <p className="text-muted text-xs">{t.securityManualEntryKey}</p>
            <code className="bg-surface-alt block rounded px-4 py-3 text-center font-mono text-sm tracking-widest">
              {enrollData.secret}
            </code>
            <button
              onClick={() => setStep("verify")}
              className="bg-brand hover:bg-brand-hover w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.securityContinue}
            </button>
          </div>
        )}
        {step === "verify" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">
              {t.securityVerifyCodeTitle}
            </h2>
            <p className="text-muted text-sm">
              {t.securityVerifyCodeDescription}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="border-border focus:border-brand w-full rounded-lg border px-4 py-3 text-center text-2xl tracking-widest outline-none"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={onVerify}
              disabled={verifyCode.length < 6}
              className="bg-brand hover:bg-brand-hover disabled:bg-brand/50 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.securityVerify}
            </button>
            <button
              onClick={onEnroll}
              className="text-brand w-full text-sm underline"
            >
              {t.securityRegenerateQr}
            </button>
          </div>
        )}
        {step === "backup-codes" && verifyData && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="text-green-500">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">
                {t.securityTwoFactorEnabledTitle}
              </h2>
            </div>
            <p className="text-muted text-sm">{t.securitySaveBackupCodes}</p>
            <div className="bg-surface-alt space-y-1 rounded-lg p-4 font-mono text-sm">
              {verifyData.backupCodes.map((code, i) => (
                <div key={code} className="flex gap-2">
                  <span className="text-muted w-6 text-right">
                    {(i + 1).toString().padStart(2, "0")}.
                  </span>
                  <span className="tracking-widest">{code}</span>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={codesSaved}
                onChange={(e) => setCodesSaved(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm">{t.securityConfirmCodesSaved}</span>
            </label>
            <button
              onClick={() => {
                setMfaEnabled(true);
                setStep("idle");
                setCodesSaved(false);
              }}
              disabled={!codesSaved}
              className="bg-brand hover:bg-brand-hover disabled:bg-brand/50 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.securityDone}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t.securityHeading}</h2>
      <div className="border-border space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t.securityTwoFactor}</p>
            <p className="text-muted text-sm">
              {mfaEnabled
                ? t.securityTwoFactorEnabled
                : t.securityTwoFactorDisabled}
            </p>
          </div>
          {mfaEnabled ? (
            <button
              onClick={() => setShowDisableInput(!showDisableInput)}
              className="bg-danger hover:bg-danger/90 rounded-lg px-4 py-2 text-sm text-white transition-colors"
            >
              {t.securityDisable}
            </button>
          ) : (
            <button
              onClick={onEnroll}
              className="bg-brand hover:bg-brand-hover rounded-lg px-4 py-2 text-sm text-white transition-colors"
            >
              {t.securitySetupTwoFactor}
            </button>
          )}
        </div>
        {showDisableInput && (
          <div className="space-y-3 pt-2">
            <p className="text-muted text-sm">
              {t.securityDisableMfaDescription}
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableCode}
                onChange={(e) =>
                  setDisableCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                className="border-border focus:border-brand w-40 rounded-lg border px-3 py-2 text-center text-lg tracking-widest outline-none"
              />
              <button
                onClick={onDisable}
                disabled={disableCode.length < 6}
                className="bg-danger hover:bg-danger/90 disabled:bg-danger/50 rounded-lg px-4 py-2 text-sm text-white transition-colors"
              >
                {t.securityDisable}
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
