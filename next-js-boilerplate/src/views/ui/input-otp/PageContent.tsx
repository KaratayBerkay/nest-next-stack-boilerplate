"use client";

import { useState, useCallback, useEffect } from "react";
import { InputOTP } from "@/components/ui/InputOTP";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const MOCK_CODE = "123456";

function InputOTPWrapper() {
  const [val, setVal] = useState("");
  return <InputOTP value={val} onChange={setVal} maxLength={6} />;
}

function TwoFactorVerification() {
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [status, setStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleResend = useCallback(() => {
    setCountdown(30);
    setCode("");
    setStatus("idle");
  }, []);

  const handleChange = useCallback((v: string) => {
    setCode(v);
    if (v === MOCK_CODE) {
      setStatus("success");
    } else {
      setStatus("idle");
    }
  }, []);

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-fg text-sm font-semibold">Verified successfully</p>
        <p className="text-muted text-xs">Your identity has been confirmed.</p>
        <button
          onClick={() => { setCode(""); setStatus("idle"); }}
          className="text-brand mt-2 text-xs underline"
        >
          Reset demo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-fg text-sm font-medium">Two-factor authentication</p>
        <p className="text-muted text-xs">
          Enter the 6-digit code sent to ****-****-<span className="tabular-nums">4321</span>
        </p>
      </div>
      <div className="flex justify-center">
        <InputOTP
          value={code}
          onChange={handleChange}
          maxLength={6}
          /* eslint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus
          description={code.length > 0 && code !== MOCK_CODE ? "Incorrect code — try 123456" : undefined}
          error={code.length > 0 && code !== MOCK_CODE ? "Invalid code" : undefined}
        />
      </div>
      <div className="flex items-center gap-2 text-xs">
        {countdown > 0 ? (
          <span className="text-muted">
            Resend in <span className="tabular-nums">{countdown}s</span>
          </span>
        ) : (
          <button
            onClick={handleResend}
            className="text-brand hover:underline"
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}

const examples: UIExample[] = [
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
    description: "Real-life 2FA flow with masked phone, countdown, and success state. Use code 123456.",
    render: () => <TwoFactorVerification />,
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
