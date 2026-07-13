import type { Metadata } from "next";
import PageContent from "@/views/ui/logo-spinner/PageContent";

export const metadata: Metadata = {
  title: "Logo Spinner",
  description: "Logo Spinner component demo",
};

export default function LogoSpinnerPage() {
  return <PageContent />;
}
