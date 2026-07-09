import { SettingsNav } from "@/components/settings/SettingsNav";
import type { SettingsLayoutProps } from "@/types/settings/SettingsLayout-types";

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row md:gap-6">
      <SettingsNav />
      <div className="min-w-0 flex-1 border-t pt-4 md:border-t-0 md:pt-0">{children}</div>
    </div>
  );
}
