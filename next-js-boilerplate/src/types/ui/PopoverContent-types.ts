import type { GlobalVariant } from "@/components/ui/global-style-variants";
import type { PopoverContentProps } from "@/types/ui/Popover-types";

export type PopoverContentLocalProps = Omit<PopoverContentProps, "variant"> & { variant?: GlobalVariant };
