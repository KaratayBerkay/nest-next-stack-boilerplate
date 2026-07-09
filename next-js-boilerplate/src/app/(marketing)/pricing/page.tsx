import type { Metadata } from "next";
import PricingPageContent from "@/views/pricing/PageContent";

export const metadata: Metadata = {
  title: "Pricing",
  description: "View our pricing plans",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
