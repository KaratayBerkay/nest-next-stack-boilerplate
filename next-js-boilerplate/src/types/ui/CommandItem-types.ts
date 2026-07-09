import type React from "react";

export interface CommandItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
}
