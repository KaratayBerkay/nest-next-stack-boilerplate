"use client";

import { InputOTP } from "@/components/ui/InputOTP";
import type { SecurityMfaStatusProps } from "@/types/views/settings/SecurityPageContent-types";

export function SecurityMfaStatus({
  t,
  lang,
  mfaEnabled,
  confirmingDisable,
  disableCode,
  error,
  onDisableCodeChange,
  onEnable,
  onConfirmDisable,
  onDisable,
}: SecurityMfaStatusProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted text-sm">
        {mfaEnabled ? t.securityTwoFactorEnabled : t.securityTwoFactorDisabled}
      </p>
      {mfaEnabled ? (
        confirmingDisable ? (
          <div className="space-y-3">
            <InputOTP
              maxLength={6}
              value={disableCode}
              onChange={onDisableCodeChange}
            />
            <button
              onClick={onDisable}
              disabled={disableCode.length < 6}
              className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {t.securityDisableTwoFactor}
            </button>
          </div>
        ) : (
          <button
            onClick={onConfirmDisable}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {t.securityDisableTwoFactor}
          </button>
        )
      ) : (
        <button
          onClick={onEnable}
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
