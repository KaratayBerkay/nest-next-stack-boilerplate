"use client";

import Link from "next/link";
import { InputOTP } from "@/components/ui/InputOTP";
import { Button } from "@/components/ui/Button";
import type { SecurityMfaStatusProps } from "@/types/views/settings/SecurityPageContent-types";

export function SecurityMfaStatus({
  t,
  lang,
  mfaEnabled,
  confirmingDisable,
  disableCode,
  error,
  submitting,
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
            <Button
              variant="destructive"
              onClick={onDisable}
              disabled={disableCode.length < 6 || submitting}
              loading={submitting}
              className="w-full"
            >
              {t.securityDisableTwoFactor}
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={onConfirmDisable}
            className="w-full"
          >
            {t.securityDisableTwoFactor}
          </Button>
        )
      ) : (
        <Button onClick={onEnable} className="w-full">
          {t.securitySetupTwoFactor}
        </Button>
      )}
      {error && <p className="text-error text-sm">{error}</p>}
      <div className="pt-4">
        <Link
          href={`/v1/${lang}/settings/sessions`}
          className="text-brand text-sm underline"
        >
          {t.navSessions}
        </Link>
      </div>
    </div>
  );
}
