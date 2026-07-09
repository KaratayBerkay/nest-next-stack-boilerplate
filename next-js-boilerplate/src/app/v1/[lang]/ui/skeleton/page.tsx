import type { Metadata } from "next";
import PageContent from "@/views/ui/skeleton/PageContent";

export const metadata: Metadata = {
  title: "Skeleton",
  description: "Skeleton component demo",
};

export default function SkeletonPage() {
  return <PageContent />;
}
