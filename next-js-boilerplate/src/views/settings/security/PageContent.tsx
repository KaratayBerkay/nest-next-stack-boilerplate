"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { InputOTP } from "@/components/ui/InputOTP";
import { useMessages } from "@/lib/i18n/MessagesProvider";

interface SecurityPageContentProps {
  initialMfaEnabled?: boolean;
  lang?: string;
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

  const handleEnroll = async () => {
    try {
      const res = await fetch("/api/auth/mfa/enroll", { method: "POST" });
      const data = await res.json();
      setEnrollData(data);
      setStep("qr-code");
      setEnrolling(true);
    } catch {
      setError("Failed to start enrollment");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });
      const data = await res.json();
      if (data.backupCodes) {
        setBackupCodes(data.backupCodes);
        setStep("backup-codes");
        setMfaEnabled(true);
      } else {
        setError(data.msg ?? "Verification failed");
      }
    } catch {
      setError("Verification failed");
    }
  };

  const handleDisable = async () => {
    try {
      const res = await fetch("/api/auth/mfa/disable", { method: "POST" });
      if (res.ok) {
        setMfaEnabled(false);
      } else {
        const data = await res.json();
        setError(data.msg ?? "Failed to disable MFA");
      }
    } catch {
      setError("Failed to disable MFA");
    }
  };

  if (!enrolling) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">{t.securityTwoFactor}</h2>
        <p className="text-muted text-sm">
          {mfaEnabled
            ? t.securityTwoFactorEnabled
            : t.securityTwoFactorDisabled}
        </p>
        {mfaEnabled ? (
          <button
            onClick={handleDisable}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {t.securityDisableTwoFactor}
          </button>
        ) : (
          <button
            onClick={handleEnroll}
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
    );
  }

  return (
    <div className="space-y-6">
      {step === "qr-code" && enrollData && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">{t.securitySetupTwoFactor}</h2>
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
          <h2 className="text-lg font-semibold">{t.securityVerifyCodeTitle}</h2>
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
            onClick={handleVerify}
            disabled={verifyCode.length < 6}
            className="bg-brand hover:bg-brand-hover disabled:bg-brand/50 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
          >
            {t.securityVerify}
          </button>
          <button
            onClick={handleEnroll}
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
  );
}
