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
  setBackupCodes: Dispatch<SetStateAction<string[]>>,
  setStep: Dispatch<SetStateAction<MfaStep>>,
  setMfaEnabled: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
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
  setMfaEnabled: Dispatch<SetStateAction<boolean>>,
  setConfirmingDisable: Dispatch<SetStateAction<boolean>>,
  setDisableCode: Dispatch<SetStateAction<string>>,
  setError: Dispatch<SetStateAction<string | null>>,
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
          onDisableCodeChange={setDisableCode}
          onEnable={() =>
            handleEnroll(setEnrollData, setStep, setEnrolling, setError)
          }
          onConfirmDisable={() => setConfirmingDisable(true)}
          onDisable={() =>
            handleDisable(
              disableCode,
              setMfaEnabled,
              setConfirmingDisable,
              setDisableCode,
              setError,
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
            )
          }
          onRegenerateQr={() =>
            handleEnroll(setEnrollData, setStep, setEnrolling, setError)
          }
          onDone={() => setEnrolling(false)}
        />
      )}
    </div>
  );
}
