import type { Metadata } from "next";
import ThemePageContent from "@/views/demos/theme/PageContent";

export const metadata: Metadata = {
  title: "Theme",
  description: "Theme switching demo",
};

export default function ThemePage() {
  return <ThemePageContent />;
}
