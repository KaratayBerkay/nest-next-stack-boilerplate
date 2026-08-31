import type { ClassNameProps } from "@/types/ui/ClassName-types";

export interface SettingsSelectProps extends ClassNameProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}
