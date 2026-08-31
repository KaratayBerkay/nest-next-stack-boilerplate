"use client";

import { Button } from "@/components/ui/Button";
import { useAutoDismiss } from "./useAutoDismiss";
import { TopBannerAlert } from "./TopBannerAlert";
import { FullWidthModalAlert } from "./FullWidthModalAlert";

export const AUTO_DISMISS_SECONDS = 30;

export function PopupAlertsExample() {
  const banner = useAutoDismiss(AUTO_DISMISS_SECONDS);
  const modal = useAutoDismiss(AUTO_DISMISS_SECONDS);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Top Banner Alert</h3>
        <p className="text-muted text-sm">
          Slides down from the top of the page like a top sheet. Dismiss it with
          the big X button, or let the circular 30-second countdown close it for
          you.
        </p>
        <Button onClick={banner.show} className="w-fit">
          Show top banner alert
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Full-Width Modal Alert</h3>
        <p className="text-muted text-sm">
          A blocking, full-width alert with a backdrop. The horizontal bar under
          the message drains as the 30-second auto-dismiss approaches. Close it
          with the X button, the Escape key, or a click on the backdrop.
        </p>
        <Button onClick={modal.show} className="w-fit">
          Show full-width modal alert
        </Button>
      </section>

      <TopBannerAlert
        phase={banner.phase}
        remainingMs={banner.remainingMs}
        onDismiss={banner.dismiss}
      />
      <FullWidthModalAlert
        phase={modal.phase}
        remainingMs={modal.remainingMs}
        onDismiss={modal.dismiss}
      />
    </div>
  );
}
