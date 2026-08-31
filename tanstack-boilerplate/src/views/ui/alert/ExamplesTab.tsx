"use client";

import { useState } from "react";
import { DismissibleAlertSection } from "./DismissibleAlertSection";
import { StatusAlertsSection } from "./StatusAlertsSection";

export function ExamplesTab() {
  const [dismissed, setDismissed] = useState(false);
  const [alertVariant, setAlertVariant] = useState<
    "default" | "info" | "success" | "warning" | "error"
  >("default");

  return (
    <div className="flex flex-col gap-6">
      <DismissibleAlertSection
        alertVariant={alertVariant}
        onVariantChange={setAlertVariant}
        dismissed={dismissed}
        onDismiss={() => setDismissed(true)}
        onReset={() => setDismissed(false)}
      />
      <StatusAlertsSection />
    </div>
  );
}
