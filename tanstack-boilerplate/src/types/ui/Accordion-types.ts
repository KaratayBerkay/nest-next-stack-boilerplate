import type {
  AccordionMultipleProps,
  AccordionSingleProps,
} from "@radix-ui/react-accordion";
import type { GlobalVariant } from "@/components/ui/global-style-variants";

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  className?: string;
};

export type AccordionShinyProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionGlassProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionNeonProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionGradientProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionItemComplexProps = {
  value: string;
  /** Left slot - avatar, icon, or any ReactNode */
  leftSlot?: React.ReactNode;
  /** Center slot - main content (title, description, etc.) */
  centerSlot?: React.ReactNode;
  /** Right slot - badges, actions, or any ReactNode */
  rightSlot?: React.ReactNode;
  /** Content that appears when expanded */
  content: React.ReactNode;
  /** Optional category label above the trigger row */
  upper?: React.ReactNode;
  variant?: GlobalVariant;
  /** @deprecated Use leftSlot, centerSlot, rightSlot instead */
  trigger?: React.ReactNode;
  triggerFontSize?: string;
  triggerFontWeight?: string;
  triggerFontFamily?: string;
  contentFontSize?: string;
  contentFontWeight?: string;
  contentFontFamily?: string;
};
