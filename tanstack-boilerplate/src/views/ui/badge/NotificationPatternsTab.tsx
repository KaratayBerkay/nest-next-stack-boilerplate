import { NotificationBellSection } from "./NotificationBellSection";
import { ToastNotificationsSection } from "./ToastNotificationsSection";
import { MessageNotificationsSection } from "./MessageNotificationsSection";

export function NotificationPatternsTab() {
  return (
    <div className="flex flex-col gap-8">
      <NotificationBellSection />
      <ToastNotificationsSection />
      <MessageNotificationsSection />
    </div>
  );
}
