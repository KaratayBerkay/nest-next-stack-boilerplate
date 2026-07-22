import { BadgeCount } from "@/components/ui/Badge";
import { bellIcon, chatIcon, mailIcon, groupIcon } from "./notificationIcons";

export function MessageNotificationsSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Message Notifications</h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
          <BadgeCount direction="right-top" count={5} rule="negative">
            {chatIcon}
          </BadgeCount>
          <span className="text-muted text-xs">Chat</span>
        </div>
        <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
          <BadgeCount direction="left-top" count={12} rule="negative">
            {mailIcon}
          </BadgeCount>
          <span className="text-muted text-xs">Mail</span>
        </div>
        <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
          <BadgeCount direction="right-bottom" count={3} rule="negative">
            {groupIcon}
          </BadgeCount>
          <span className="text-muted text-xs">Groups</span>
        </div>
        <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
          <BadgeCount direction="middle-top" count={99} max={99} rule="negative">
            {bellIcon}
          </BadgeCount>
          <span className="text-muted text-xs">Overflow 99+</span>
        </div>
        <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
          <BadgeCount direction="right-top" count={0} rule="negative" showZero>
            {bellIcon}
          </BadgeCount>
          <span className="text-muted text-xs">Zero count</span>
        </div>
        <div className="surface flex flex-col items-center gap-3 rounded-xl border p-4 shadow-sm">
          <BadgeCount direction="right-top" count={0} rule="negative" dot>
            {bellIcon}
          </BadgeCount>
          <span className="text-muted text-xs">Dot only</span>
        </div>
      </div>
    </section>
  );
}
