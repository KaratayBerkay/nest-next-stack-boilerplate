export interface ScenarioSelectorsProps {
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
