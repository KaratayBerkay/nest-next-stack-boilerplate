"use client";

import { useState, useCallback } from "react";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { ERROR_SCENARIOS } from "@/lib/forms/error-scenarios";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { useAllMessages } from "@/lib/i18n/MessagesProvider";
import type { ExceptionResponse } from "@/lib/api-client";
import type { ClientException } from "@/lib/exception-handler";

const GROUPS = [
  { label: "Toast surface", surface: "toast" as const },
  { label: "Form-field surface", surface: "form-field" as const },
  { label: "Full-page surface", surface: "full-page" as const },
  { label: "Badge surface", surface: "badge" as const },
];

const NETWORK_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "delayed", label: "Delayed (800ms)" },
  { value: "timeout", label: "Timeout (5s)" },
  { value: "offline", label: "Offline" },
  { value: "random", label: "Random (30% fail)" },
];

interface Props {
  errorMessagesByLocale: Record<string, Record<string, unknown>>;
}

export default function ErrorLabPage({ errorMessagesByLocale }: Props) {
  const [selectedScenario, setSelectedScenario] = useState(ERROR_SCENARIOS[0].id);
  const [locale, setLocale] = useState<"en" | "tr">("en");
  const [network, setNetwork] = useState("instant");
  const [result, setResult] = useState<ExceptionResponse | ClientException | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { simulateError } = useFormsDemoActions();
  const allMessages = useAllMessages();

  const handleTrigger = useCallback(async () => {
    setResult(null);
    setFormError(null);

    if (network === "offline") {
      const { clientException } = await import("@/lib/exception-handler");
      const exc = clientException("EX_WS_UNSTABLE", "You are offline", "forms.errors.connectionUnstable");
      setResult(exc);
      const surface = getSurface(exc.exc);
      if (surface === "toast") {
        toast({ description: exceptionHandler(exc, allMessages), variant: "destructive" });
      } else if (surface === "form-field") {
        const t = errorMessagesByLocale[locale];
        setFormError(exceptionHandler(exc, t));
      }
      return;
    }

    if (network === "timeout") {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        await simulateError(selectedScenario, { delayMs: 6000 });
        clearTimeout(timeoutId);
      } catch {
        const { clientException } = await import("@/lib/exception-handler");
        const exc = clientException("EX_INTERNAL", "Request timed out", "forms.errors.unknown");
        setResult(exc);
        toast({ description: "Request timed out", variant: "destructive" });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const parsed = ERROR_SCENARIOS.find((s) => s.id === selectedScenario)!;
      const delayMs = network === "delayed" ? 800 : 0;
      const failRate = network === "random" ? 0.3 : 1;
      const res = await simulateError(parsed.id, { delayMs, failRate });
      setResult(res);
      const surface = getSurface(res.exc);
      const t = errorMessagesByLocale[locale] ?? allMessages;
      if (surface === "toast") {
        toast({ description: exceptionHandler(res, t), variant: "destructive" });
      } else if (surface === "form-field") {
        const { form } = exceptionToFormErrors(res, t);
        setFormError(form);
      } else {
        setFormError(exceptionHandler(res, t));
      }
    } catch (err) {
      const exc = (err as { exception?: ExceptionResponse }).exception;
      if (exc) {
        setResult(exc);
        const t = errorMessagesByLocale[locale] ?? allMessages;
        toast({ description: exceptionHandler(exc, t), variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  }, [selectedScenario, locale, network, simulateError, toast, allMessages, errorMessagesByLocale]);

  const surfaceGroups = GROUPS.map((g) => ({
    ...g,
    scenarios: ERROR_SCENARIOS.filter((s) => getSurface(s.exc) === g.surface),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Error & Async States Lab</h2>
        <p className="text-muted text-xs">Test every error surface and locale combination</p>
      </div>

      <div className="surface grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="error-scenario-select" className="text-xs font-medium">Error Scenario</label>
          <NativeSelect
            id="error-scenario-select"
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
          >
            {surfaceGroups.map((group) => (
              <optgroup key={group.surface} label={group.label}>
                {group.scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.exc}
                  </option>
                ))}
              </optgroup>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="locale-select" className="text-xs font-medium">Locale</label>
          <NativeSelect id="locale-select" value={locale} onChange={(e) => setLocale(e.target.value as "en" | "tr")}>
            <option value="en">English</option>
            <option value="tr">Turkish</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="network-select" className="text-xs font-medium">Network Condition</label>
          <NativeSelect id="network-select" value={network} onChange={(e) => setNetwork(e.target.value)}>
            {NETWORK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <Button onClick={handleTrigger} disabled={loading || !user} className="self-start">
        {loading ? "Triggering..." : "Trigger Error"}
      </Button>

      {formError && <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />}

      {result && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium">Raw Payload</p>
          <pre className="surface overflow-auto rounded-lg border border-border p-4 text-xxs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
