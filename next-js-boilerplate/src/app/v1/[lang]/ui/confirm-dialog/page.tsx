import type { Metadata } from "next";
import PageContent from "@/views/ui/confirm-dialog/PageContent";

export const metadata: Metadata = {
  title: "Confirm Dialog",
  description: "Confirm Dialog component demo",
};

export default function ConfirmDialogPage() {
  return <PageContent />;
}
