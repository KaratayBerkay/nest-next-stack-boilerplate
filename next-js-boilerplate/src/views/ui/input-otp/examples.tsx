import { InputOTPWrapper } from "./InputOTPWrapper";
import { TwoFactorVerification } from "./TwoFactorVerification";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

export const examples: UIExample[] = [
  {
    id: "usage",
    title: "SMS Verification",
    description: "6-digit OTP input with autocomplete and paste support.",
    render: () => (
      <div className="flex flex-col items-center gap-4">
        <InputOTPWrapper />
      </div>
    ),
  },
  {
    id: "two-factor",
    title: "2FA Verification",
    description:
      "Real-life 2FA flow with masked phone, countdown, and success state. Use code 123456.",
    render: () => <TwoFactorVerification />,
  },
];
