import type { Dispatch, SetStateAction } from "react";
import type { I18nMessages } from "@/generated/i18n-messages";

export interface SecurityPageContentProps {
  initialMfaEnabled?: boolean;
  lang?: string;
}

export type MfaStep = "idle" | "qr-code" | "verify" | "backup-codes";

export interface SecurityMfaStatusProps {
  t: I18nMessages["settings"];
  lang: string;
  mfaEnabled: boolean;
  confirmingDisable: boolean;
  disableCode: string;
  error: string | null;
  submitting: boolean;
  onDisableCodeChange: Dispatch<SetStateAction<string>>;
  onEnable: () => void;
  onConfirmDisable: () => void;
  onDisable: () => void;
}

export interface SecurityChangePasswordProps {
  t: I18nMessages["settings"];
}

export interface SecurityMfaWizardProps {
  t: I18nMessages["settings"];
  step: MfaStep;
  enrollData: { otpauthUrl: string; secret: string } | null;
  verifyCode: string;
  backupCodes: string[];
  codesSaved: boolean;
  error: string | null;
  submitting: boolean;
  onVerifyCodeChange: Dispatch<SetStateAction<string>>;
  onCodesSavedChange: Dispatch<SetStateAction<boolean>>;
  onContinueToVerify: () => void;
  onVerify: () => void;
  onRegenerateQr: () => void;
  onDone: () => void;
}
