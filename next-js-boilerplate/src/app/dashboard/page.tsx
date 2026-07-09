import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard overview",
};

export default function DashboardPage() {
  return (
    <p data-testid="dashboard-main" className="text-muted text-sm">
      Main content (the implicit <code>children</code> slot).
    </p>
  );
}
