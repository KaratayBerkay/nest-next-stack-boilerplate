"use client";

import { Combobox } from "@/components/ui/Combobox";
import { Dropdown } from "@/components/ui/Dropdown";
import { ERROR_SCENARIOS } from "@/lib/forms/error-scenarios";
import { getSurface } from "@/lib/exception-handler";
import { GROUPS, NETWORK_OPTIONS } from "./trigger-handler";
import type { ScenarioSelectorsProps } from "@/types/views/forms/ScenarioSelectors-types";

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

  const scenarioOptions = surfaceGroups.flatMap((group) =>
    group.scenarios.map((s) => ({
      value: s.id,
      label: `${s.id} — ${s.exc}`,
      group: group.label,
    })),
  );

  const LOCALE_OPTIONS = [
    { value: "en", label: "English" },
    { value: "tr", label: "Turkish" },
  ];

  return (
    <div className="surface border-border grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">
          {t.errorLab.scenarioLabel}
        </label>
        <Combobox
          options={scenarioOptions}
          value={selectedScenario}
          onValueChange={(value) => setSelectedScenario(value as string)}
          placeholder={t.errorLab.scenarioLabel}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="locale-select" className="text-xs font-medium">
          {t.errorLab.localeLabel}
        </label>
        <Dropdown
          name="locale-select"
          aria-label={t.errorLab.localeLabel}
          options={LOCALE_OPTIONS}
          value={locale}
          onChange={(value) => setLocale(value as "en" | "tr")}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="network-select" className="text-xs font-medium">
          {t.errorLab.networkLabel}
        </label>
        <Dropdown
          name="network-select"
          aria-label={t.errorLab.networkLabel}
          options={NETWORK_OPTIONS}
          value={network}
          onChange={setNetwork}
        />
      </div>
    </div>
  );
}
