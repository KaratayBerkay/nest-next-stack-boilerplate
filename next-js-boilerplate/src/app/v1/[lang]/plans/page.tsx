import type { Metadata } from "next";
import PageContent from "@/views/plans/PageContent";

export const metadata: Metadata = {
  title: "Plans",
  description: "View available plans",
};

export default function PlansPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return <PageContent params={params} />;
}
