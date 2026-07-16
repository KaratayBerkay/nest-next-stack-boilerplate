import type { Metadata } from "next";
import PageContent from "@/views/ui/input-otp/PageContent";

export const metadata: Metadata = {
  title: "Input OTP",
  description: "Input OTP component demo",
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function InputOtpPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return <PageContent initialTab={tab} />;
}
