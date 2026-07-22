import { UserRolesSection } from "./UserRolesSection";
import { OrderStatusSection } from "./OrderStatusSection";
import { PriorityLabelsSection } from "./PriorityLabelsSection";
import { PaymentStatusSection } from "./PaymentStatusSection";
import { ButtonBadgesSection } from "./ButtonBadgesSection";

export function StatusLabelsTab() {
  return (
    <div className="flex flex-col gap-6">
      <UserRolesSection />
      <OrderStatusSection />
      <PriorityLabelsSection />
      <PaymentStatusSection />
      <ButtonBadgesSection />
    </div>
  );
}
