import type { UIExample } from "@/types/ui/ExampleTabs-types";

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
