import type { ReactNode } from "react";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";

export interface TemplateBrowserProps {
  title: string;
  intro: string;
  examples: UIExample[];
  /** views/pages directory name; keys the generated manifest + source modules. */
  category: string;
  initialTab?: string;
  initialFull?: boolean;
}

export interface TemplateBrowserMessages {
  searchPlaceholder: string;
  countLabel: string;
  noResults: string;
  clearSearch: string;
  backToGrid: string;
  previous: string;
  next: string;
  positionLabel: string;
  copyLink: string;
  copied: string;
  fullScreen: string;
  exitFullScreen: string;
  viewCode: string;
  viewPreview: string;
  copyCode: string;
  codeUnavailable: string;
}

export interface TemplateCardProps {
  example: UIExample;
  onOpen: () => void;
}

export interface TemplateDetailProps {
  example: UIExample;
  index: number;
  total: number;
  category: string;
  codeOpen: boolean;
  onToggleCode: () => void;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenFull: () => void;
  t: TemplateBrowserMessages;
}

export interface ScaledPreviewProps {
  children: ReactNode;
}

export interface LazyMountProps {
  children: ReactNode;
  placeholder: ReactNode;
}

export interface CodePanelProps {
  category: string;
  variantId: string;
  copyLabel: string;
  copiedLabel: string;
  unavailableLabel: string;
}
