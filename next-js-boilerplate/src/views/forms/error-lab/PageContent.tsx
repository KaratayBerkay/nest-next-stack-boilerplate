"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { ERROR_SCENARIOS } from "@/lib/forms/error-scenarios";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { useAllMessages, useMessages } from "@/lib/i18n/MessagesProvider";
import { getSurface } from "@/lib/exception-handler";
import type { ExceptionResponse } from "@/lib/api-client";
import type { ClientException } from "@/lib/exception-handler";
import type { ErrorLabPageProps } from "@/types/forms/ErrorLabPage-types";
import {
  GROUPS,
  NETWORK_OPTIONS,
  handleTriggerErrorLab,
} from "@/views/forms/error-lab/trigger-handler";
import { ScenarioSelectors } from "./ScenarioSelectors";
import { ErrorResultDisplay } from "./ErrorResultDisplay";

export default function ErrorLabPage({
  errorMessagesByLocale,
}: ErrorLabPageProps) {
  const [selectedScenario, setSelectedScenario] = useState(
    ERROR_SCENARIOS[0].id,
  );
  const [locale, setLocale] = useState<"en" | "tr">("en");
  const [network, setNetwork] = useState("instant");
  const [result, setResult] = useState<
    ExceptionResponse | ClientException | null
  >(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useMessages("forms");
  const { toast } = useToast();
  const { user } = useAuth();
  const { simulateError } = useFormsDemoActions();
  const allMessages = useAllMessages();

  const handleTrigger = useCallback(
    () =>
      handleTriggerErrorLab({
        selectedScenario,
        locale,
        network,
        simulateError,
        toast,
        allMessages,
        errorMessagesByLocale,
        setResult,
        setFormError,
        setLoading,
      }),
    [
      selectedScenario,
      locale,
      network,
      simulateError,
      toast,
      allMessages,
      errorMessagesByLocale,
    ],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.errorLab.heading}</h2>
        <p className="text-muted text-xs">{t.errorLab.subheading}</p>
      </div>

      <ScenarioSelectors
        selectedScenario={selectedScenario}
        setSelectedScenario={setSelectedScenario}
        locale={locale}
        setLocale={setLocale}
        network={network}
        setNetwork={setNetwork}
        t={t}
      />

      <Button
        onClick={handleTrigger}
        disabled={loading || !user}
        className="self-start"
      >
        {loading ? t.errorLab.triggering : t.errorLab.trigger}
      </Button>

      {formError && (
        <FormErrorBanner
          message={formError}
          onDismiss={() => setFormError(null)}
        />
      )}

      <ErrorResultDisplay result={result} label={t.errorLab.rawPayload} />
    </div>
  );
}
