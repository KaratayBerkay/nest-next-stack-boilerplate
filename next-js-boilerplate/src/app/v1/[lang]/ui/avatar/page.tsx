import type { Metadata } from "next";
import PageContent from "@/views/ui/avatar/PageContent";

export const metadata: Metadata = {
  title: "Avatar",
  description: "Avatar component demo",
};

export default function AvatarPage() {
  return <PageContent />;
}
