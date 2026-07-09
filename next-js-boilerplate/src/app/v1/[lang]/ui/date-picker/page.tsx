import type { Metadata } from "next";
import PageContent from "@/views/ui/date-picker/PageContent";

export const metadata: Metadata = {
  title: "Date Picker",
  description: "Date Picker component demo",
};

export default function DatePickerPage() {
  return <PageContent />;
}
