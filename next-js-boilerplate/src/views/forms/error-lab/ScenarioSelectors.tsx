"use client";

import { NativeSelect } from "@/components/ui/NativeSelect";
import { ERROR_SCENARIOS } from "@/lib/forms/error-scenarios";
import { getSurface } from "@/lib/exception-handler";
import { GROUPS, NETWORK_OPTIONS } from "./trigger-handler";
interface ScenarioSelectorsProps {
  selectedScenario: string;
  setSelectedScenario: (v: string) => void;
  locale: "en" | "tr";
  setLocale: (v: "en" | "tr") => void;
  network: string;
  setNetwork: (v: string) => void;
  t: {
    errorLab: {
      scenarioLabel: string;
      localeLabel: string;
      networkLabel: string;
    };
  };
}

export function ScenarioSelectors({
  selectedScenario,
  setSelectedScenario,
  locale,
  setLocale,
  network,
  setNetwork,
  t,
}: ScenarioSelectorsProps) {
  const surfaceGroups = GROUPS.map((g) => ({
    ...g,
    scenarios: ERROR_SCENARIOS.filter((s) => getSurface(s.exc) === g.surface),
  }));

  return (
    <div className="surface border-border grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="error-scenario-select" className="text-xs font-medium">
          {t.errorLab.scenarioLabel}
        </label>
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
        <label htmlFor="locale-select" className="text-xs font-medium">
          {t.errorLab.localeLabel}
        </label>
        <NativeSelect
          id="locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as "en" | "tr")}
        >
          <option value="en">English</option>
          <option value="tr">Turkish</option>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="network-select" className="text-xs font-medium">
          {t.errorLab.networkLabel}
        </label>
        <NativeSelect
          id="network-select"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
        >
          {NETWORK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
