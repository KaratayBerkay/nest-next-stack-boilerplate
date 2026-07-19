"use client";

import { useState } from "react";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";

export default function FormErrorBannerPage() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Form Error Banner</h2>
        <p className="text-muted text-xs">Dismissable inline error alert for form-level errors</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-xs font-medium">With dismiss</p>
          <FormErrorBanner message="This is an error message" onDismiss={() => setVisible(false)} />
        </div>
        <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-xs font-medium">Without dismiss</p>
          <FormErrorBanner message="Non-dismissable error" />
        </div>
        <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
          <p className="text-xs font-medium">Hidden (null message)</p>
          <FormErrorBanner message={null} />
        </div>
      </div>
    </div>
  );
}
