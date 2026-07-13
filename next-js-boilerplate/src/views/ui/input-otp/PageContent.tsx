"use client";

import { useState } from "react";
import { InputOTP, InputOTPGroup } from "@/components/ui/InputOTP";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function InputOTPWrapper() {
  const [val, setVal] = useState("");
  return <InputOTP value={val} onChange={setVal} maxLength={6} />;
}

const examples: UIExample[] = [
  {
    id: "components",
    title: "SMS Verification",
    description: "6-digit OTP input with autocomplete and paste support.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <InputOTPWrapper />
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Secure PIN",
    description: "4-digit masked PIN input.",
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function InputOtpPage() {
  return (
    <ExampleTabs
      title="Input OTP"
      intro="A one-time password input."
      examples={examples}
    />
  );
}
