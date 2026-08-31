import type { UIExample } from "@/types/views/ui/ExampleTabs-types";

export interface ExampleTabsDesktopBarProps {
  examples: UIExample[];
  currentValue: string;
  onChange: (value: string) => void;
  baseId: string;
}

export interface ExampleTabsMobileAccordionProps {
  examples: UIExample[];
  currentValue: string;
  onChange: (value: string) => void;
  accordionOpen: boolean;
  onToggle: () => void;
}

export interface ExamplePanelProps {
  example: UIExample;
  baseId: string;
  viewMode: "preview" | "code";
  onToggleView: () => void;
}
