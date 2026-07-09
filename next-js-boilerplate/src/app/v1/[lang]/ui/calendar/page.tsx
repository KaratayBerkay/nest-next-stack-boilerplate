import type { Metadata } from "next";
import PageContent from "@/views/ui/calendar/PageContent";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Calendar component demo",
};

export default function CalendarPage() {
  return <PageContent />;
}
