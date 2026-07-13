import type { Metadata } from "next";
import PageContent from "@/views/ui/time-input/PageContent";

export const metadata: Metadata = {
  title: "Time Input",
  description: "Time input component with dropdown selectors and timezone support",
};

export default function TimeInputPage() {
  return <PageContent />;
}
