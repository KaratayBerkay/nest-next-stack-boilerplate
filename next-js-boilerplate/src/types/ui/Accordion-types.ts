import type {
  AccordionMultipleProps,
  AccordionSingleProps,
} from "@radix-ui/react-accordion";

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  className?: string;
};

export type AccordionShinyProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionGlassProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionNeonProps = React.HTMLAttributes<HTMLDivElement>;

export type AccordionGradientProps = React.HTMLAttributes<HTMLDivElement>;
