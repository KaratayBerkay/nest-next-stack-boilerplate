import { BadgeCount } from "@/components/ui/Badge";
import { bellIcon } from "./notificationIcons";
import type { BadgeCountDirection } from "@/types/ui/BadgeCount-types";

const positions: { dir: BadgeCountDirection; label: string }[] = [
  { dir: "right-top", label: "Right top" },
  { dir: "left-top", label: "Left top" },
  { dir: "right-bottom", label: "Right bottom" },
  { dir: "left-bottom", label: "Left bottom" },
  { dir: "middle-top", label: "Middle top" },
  { dir: "middle-bottom", label: "Middle bottom" },
];

export function NotificationBellSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Notification Bell</h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {positions.map(({ dir, label }) => (
          <div
            key={dir}
            className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm"
          >
            <BadgeCount direction={dir} count={3} rule="negative">
              {bellIcon}
            </BadgeCount>
            <span className="text-muted text-xs">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
