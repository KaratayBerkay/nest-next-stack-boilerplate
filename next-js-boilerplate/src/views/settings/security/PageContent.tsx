"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { InputOTP } from "@/components/ui/InputOTP";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsSecurityPageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  enrollMfaServer,
  verifyMfaEnrollmentServer,
  disableMfaServer,
} from "@/api/server/auth/mfa";
import type { SecurityPageContentProps } from "@/types/views/settings/SecurityPageContent-types";

async function handleEnroll(
  setEnrollData: (data: { otpauthUrl: string; secret: string }) => void,
  setStep: (step: "idle" | "qr-code" | "verify" | "backup-codes") => void,
  setEnrolling: (enrolling: boolean) => void,
  setError: (error: string | null) => void,
) {
  try {
    const data = await enrollMfaServer();
    setEnrollData(data);
    setStep("qr-code");
    setEnrolling(true);
  } catch {
    setError("Failed to start enrollment");
  }
}

async function handleVerify(
  verifyCode: string,
  setBackupCodes: (codes: string[]) => void,
  setStep: (step: "idle" | "qr-code" | "verify" | "backup-codes") => void,
  setMfaEnabled: (enabled: boolean) => void,
  setError: (error: string | null) => void,
) {
  try {
    const data = await verifyMfaEnrollmentServer(verifyCode);
    if (data.backupCodes) {
      setBackupCodes(data.backupCodes);
      setStep("backup-codes");
      setMfaEnabled(true);
    } else {
      setError("Verification failed");
    }
  } catch {
    setError("Verification failed");
  }
}

async function handleDisable(
  disableCode: string,
  setMfaEnabled: (enabled: boolean) => void,
  setConfirmingDisable: (confirming: boolean) => void,
  setDisableCode: (code: string) => void,
  setError: (error: string | null) => void,
) {
  try {
    const data = await disableMfaServer(disableCode);
    if (data.success) {
      setMfaEnabled(false);
      setConfirmingDisable(false);
      setDisableCode("");
    } else {
      setError("Failed to disable MFA");
    }
  } catch {
    setError("Failed to disable MFA");
  }
}

export default function SecurityPageContent({
  initialMfaEnabled = false,
  lang = "en",
}: SecurityPageContentProps) {
  const t = useMessages("settings");
  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled);
  const [enrolling, setEnrolling] = useState(false);
  const [step, setStep] = useState<
    "idle" | "qr-code" | "verify" | "backup-codes"
  >("idle");
  const [enrollData, setEnrollData] = useState<{
    otpauthUrl: string;
    secret: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [codesSaved, setCodesSaved] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [confirmingDisable, setConfirmingDisable] = useState(false);

  if (!enrolling) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t.securityHeading}
          actions={<PageInfoButton content={settingsSecurityPageInfo} />}
        />
        <div className="space-y-6">
          <p className="text-muted text-sm">
            {mfaEnabled
              ? t.securityTwoFactorEnabled
              : t.securityTwoFactorDisabled}
          </p>
          {mfaEnabled ? (
            confirmingDisable ? (
              <div className="space-y-3">
                <InputOTP
                  maxLength={6}
                  value={disableCode}
                  onChange={setDisableCode}
                />
                <button
                  onClick={() =>
                    handleDisable(
                      disableCode,
                      setMfaEnabled,
                      setConfirmingDisable,
                      setDisableCode,
                      setError,
                    )
                  }
                  disabled={disableCode.length < 6}
                  className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {t.securityDisableTwoFactor}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingDisable(true)}
                className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {t.securityDisableTwoFactor}
              </button>
            )
          ) : (
            <button
              onClick={() =>
                handleEnroll(setEnrollData, setStep, setEnrolling, setError)
              }
              className="bg-brand hover:bg-brand-hover w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.securitySetupTwoFactor}
            </button>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="pt-4">
            <a
              href={`/v1/${lang}/settings/sessions`}
              className="text-brand text-sm underline"
            >
              {t.navSessions}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.securityHeading}
        actions={<PageInfoButton content={settingsSecurityPageInfo} />}
      />
      <div className="space-y-6">
        {step === "qr-code" && enrollData && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">
              {t.securitySetupTwoFactor}
            </h2>
            <p className="text-muted text-sm">{t.securityScanQrDescription}</p>
            <div className="flex justify-center">
              <QRCodeSVG value={enrollData.otpauthUrl} size={240} level="M" />
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
            <InputOTP
              maxLength={6}
              value={verifyCode}
              onChange={setVerifyCode}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={() =>
                handleVerify(
                  verifyCode,
                  setBackupCodes,
                  setStep,
                  setMfaEnabled,
                  setError,
                )
              }
              disabled={verifyCode.length < 6}
              className="bg-brand hover:bg-brand-hover disabled:bg-brand/50 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.securityVerify}
            </button>
            <button
              onClick={() =>
                handleEnroll(setEnrollData, setStep, setEnrolling, setError)
              }
              className="text-brand w-full text-sm underline"
            >
              {t.securityRegenerateQr}
            </button>
          </div>
        )}
        {step === "backup-codes" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">
              {t.securityTwoFactorEnabledTitle}
            </h2>
            <p className="text-muted text-sm">{t.securitySaveBackupCodes}</p>
            <div className="bg-surface-alt space-y-1 rounded-lg p-4 font-mono text-sm">
              {backupCodes.map((code, i) => (
                <div key={i} className="tracking-wider">
                  {String(i + 1).padStart(2, "0")}. {code}
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={codesSaved}
                onChange={(e) => setCodesSaved(e.target.checked)}
                className="h-4 w-4"
              />
              {t.securityConfirmCodesSaved}
            </label>
            <button
              onClick={() => setEnrolling(false)}
              disabled={!codesSaved}
              className="bg-brand hover:bg-brand-hover disabled:bg-brand/50 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
            >
              {t.securityDone}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
