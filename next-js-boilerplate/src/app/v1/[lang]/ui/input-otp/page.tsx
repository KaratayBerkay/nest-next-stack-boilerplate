import type { Metadata } from "next";
import PageContent from "@/views/ui/input-otp/PageContent";

export const metadata: Metadata = {
  title: "Input OTP",
  description: "Input OTP component demo",
};

export default function InputOtpPage() {
  return <PageContent />;
}
