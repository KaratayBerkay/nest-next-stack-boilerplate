import type { ReactNode } from "react";

export interface VariantGalleryProps {
  variants: string[];
  sizes: string[];
  render: (variant: string, size: string) => ReactNode;
  title?: string;
}