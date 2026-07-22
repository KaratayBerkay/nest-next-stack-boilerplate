"use client";

import { Switch } from "@/components/ui/Switch";
import type { PrivacyToggleRowProps } from "@/types/settings/PrivacyToggleRow-types";

export function PrivacyToggleRow({ title, description, checked, onChange, children }: PrivacyToggleRowProps) {
  return (
    <div className="border-border flex flex-col rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-muted text-xs">{description}</span>
        </div>
        <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
      </div>
      {children}
    </div>
  );
}
