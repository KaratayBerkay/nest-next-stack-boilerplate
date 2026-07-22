"use client";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { examples } from "./examples";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

export default function InputOtpPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Input OTP"
      intro="A one-time password input."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
