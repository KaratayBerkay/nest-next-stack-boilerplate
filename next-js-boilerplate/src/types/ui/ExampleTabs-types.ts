import type { ReactNode } from "react";

export interface UIExample {
  id: string;
  title: string;
  description: string;
  render: () => ReactNode;
}

export interface ExampleTabsProps {
  title: string;
  intro: string;
  examples: UIExample[];
  initialTab?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}
