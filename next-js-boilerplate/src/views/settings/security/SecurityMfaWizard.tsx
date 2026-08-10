"use client";

import { QRCodeSVG } from "qrcode.react";
import { InputOTP } from "@/components/ui/InputOTP";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import type { SecurityMfaWizardProps } from "@/types/views/settings/SecurityPageContent-types";

export function SecurityMfaWizard({
  t,
  step,
  enrollData,
  verifyCode,
  backupCodes,
  codesSaved,
  error,
  onVerifyCodeChange,
  onCodesSavedChange,
  onContinueToVerify,
  onVerify,
  onRegenerateQr,
  onDone,
}: SecurityMfaWizardProps) {
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
          <Button onClick={onContinueToVerify} className="w-full">
            {t.securityContinue}
          </Button>
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
            onChange={onVerifyCodeChange}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <Button
            onClick={onVerify}
            disabled={verifyCode.length < 6}
            className="w-full"
          >
            {t.securityVerify}
          </Button>
          <Button variant="link" onClick={onRegenerateQr} className="w-full">
            {t.securityRegenerateQr}
          </Button>
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
            <Checkbox
              checked={codesSaved}
              onChange={(e) => onCodesSavedChange(e.target.checked)}
            />
            {t.securityConfirmCodesSaved}
          </label>
          <Button onClick={onDone} disabled={!codesSaved} className="w-full">
            {t.securityDone}
          </Button>
        </div>
      )}
    </div>
  );
}
