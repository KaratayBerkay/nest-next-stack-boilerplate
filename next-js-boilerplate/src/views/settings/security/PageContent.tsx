"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsSecurityPageInfo } from "@/constants/page-info";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  enrollMfaServer,
  verifyMfaEnrollmentServer,
  disableMfaServer,
} from "@/api/server/auth/mfa";
import { SecurityChangePassword } from "./SecurityChangePassword";
import { SecurityMfaStatus } from "./SecurityMfaStatus";
import { SecurityMfaWizard } from "./SecurityMfaWizard";
import type { I18nMessages } from "@/generated/i18n-messages";
import type {
  SecurityPageContentProps,
  MfaStep,
} from "@/types/views/settings/SecurityPageContent-types";

async function handleEnroll(
  setEnrollData: Dispatch<
    SetStateAction<{ otpauthUrl: string; secret: string } | null>
  >,
  setStep: Dispatch<SetStateAction<MfaStep>>,
  setEnrolling: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setVerifyCode: Dispatch<SetStateAction<string>>,
  setCodesSaved: Dispatch<SetStateAction<boolean>>,
  t: I18nMessages["settings"],
) {
  // Cleared up front, not just on this call's own success path — otherwise
  // a stale error from a previous failed attempt (or a previous step
  // entirely) keeps rendering underneath a since-succeeded flow.
  setError(null);
  try {
    const data = await enrollMfaServer();
    setEnrollData(data);
    setStep("qr-code");
    setEnrolling(true);
    // A new secret invalidates any code already typed for the old one
    // (reachable via "Regenerate QR" from the verify step), and a fresh
    // enrollment must not start with the previous cycle's backup-codes
    // acknowledgment still checked.
    setVerifyCode("");
    setCodesSaved(false);
  } catch {
    setError(t.securityMfaEnrollFailed);
  }
}

async function handleVerify(
  verifyCode: string,
  setBackupCodes: Dispatch<SetStateAction<string[]>>,
  setStep: Dispatch<SetStateAction<MfaStep>>,
  setMfaEnabled: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  t: I18nMessages["settings"],
) {
  setError(null);
  setSubmitting(true);
  try {
    const data = await verifyMfaEnrollmentServer(verifyCode);
    if (data.backupCodes) {
      setBackupCodes(data.backupCodes);
      setStep("backup-codes");
      setMfaEnabled(true);
    } else {
      setError(t.securityMfaVerifyFailed);
    }
  } catch {
    setError(t.securityMfaVerifyFailed);
  } finally {
    setSubmitting(false);
  }
}

async function handleDisable(
  disableCode: string,
  setMfaEnabled: Dispatch<SetStateAction<boolean>>,
  setConfirmingDisable: Dispatch<SetStateAction<boolean>>,
  setDisableCode: Dispatch<SetStateAction<string>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  t: I18nMessages["settings"],
) {
  setError(null);
  setSubmitting(true);
  try {
    const data = await disableMfaServer(disableCode);
    if (data.success) {
      setMfaEnabled(false);
      setConfirmingDisable(false);
      setDisableCode("");
    } else {
      setError(t.securityMfaDisableFailed);
    }
  } catch {
    setError(t.securityMfaDisableFailed);
  } finally {
    setSubmitting(false);
  }
}

export default function SecurityPageContent({
  initialMfaEnabled = false,
  lang = "en",
}: SecurityPageContentProps) {
  const t = useMessages("settings");
  const [mfaEnabled, setMfaEnabled] = useState(initialMfaEnabled);
  const [enrolling, setEnrolling] = useState(false);
  const [step, setStep] = useState<MfaStep>("idle");
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
  const [mfaSubmitting, setMfaSubmitting] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.securityHeading}
        actions={<PageInfoButton content={settingsSecurityPageInfo} />}
      />
      <div className="border-border space-y-3 border-b pb-6">
        <h2 className="text-sm font-semibold">{t.securityChangePassword}</h2>
        <SecurityChangePassword t={t} />
      </div>
      {!enrolling ? (
        <SecurityMfaStatus
          t={t}
          lang={lang}
          mfaEnabled={mfaEnabled}
          confirmingDisable={confirmingDisable}
          disableCode={disableCode}
          error={error}
          submitting={mfaSubmitting}
          onDisableCodeChange={setDisableCode}
          onEnable={() =>
            handleEnroll(
              setEnrollData,
              setStep,
              setEnrolling,
              setError,
              setVerifyCode,
              setCodesSaved,
              t,
            )
          }
          onConfirmDisable={() => {
            setError(null);
            setConfirmingDisable(true);
          }}
          onDisable={() =>
            handleDisable(
              disableCode,
              setMfaEnabled,
              setConfirmingDisable,
              setDisableCode,
              setError,
              setMfaSubmitting,
              t,
            )
          }
        />
      ) : (
        <SecurityMfaWizard
          t={t}
          step={step}
          enrollData={enrollData}
          verifyCode={verifyCode}
          backupCodes={backupCodes}
          codesSaved={codesSaved}
          error={error}
          submitting={mfaSubmitting}
          onVerifyCodeChange={setVerifyCode}
          onCodesSavedChange={setCodesSaved}
          onContinueToVerify={() => setStep("verify")}
          onVerify={() =>
            handleVerify(
              verifyCode,
              setBackupCodes,
              setStep,
              setMfaEnabled,
              setError,
              setMfaSubmitting,
              t,
            )
          }
          onRegenerateQr={() =>
            handleEnroll(
              setEnrollData,
              setStep,
              setEnrolling,
              setError,
              setVerifyCode,
              setCodesSaved,
              t,
            )
          }
          onDone={() => setEnrolling(false)}
        />
      )}
    </div>
  );
}
