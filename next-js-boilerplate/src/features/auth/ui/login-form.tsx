"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { LoginCredentialsForm } from "./LoginCredentialsForm";
import { MfaChallengeForm } from "./MfaChallengeForm";
import type { MfaState } from "@/types/auth/LoginForm-types";

export function LoginForm() {
  const t = useMessages("auth");
  const { login, verifyMfa, user, loading } = useAuth();
  const [mfaState, setMfaState] = useState<MfaState | null>(null);

  if (loading) {
    return <p className="text-muted text-sm">{t.loading}</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-600">
          {t.signedInAs.replace("{email}", user.email)}
        </p>
        <p className="text-muted text-xs">
          {t.role} {user.role} &middot; {t.status} {user.status}
        </p>
      </div>
    );
  }

  if (mfaState) {
    return (
      <MfaChallengeForm
        mfaState={mfaState}
        verifyMfa={verifyMfa}
        setMfaState={setMfaState}
        onBackToCredentials={() => setMfaState(null)}
      />
    );
  }

  return <LoginCredentialsForm login={login} onMfaRequired={setMfaState} />;
}
