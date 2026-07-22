"use client";

import {
  useState,
  useCallback,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { InputOTP } from "@/components/ui/InputOTP";

const MOCK_CODE = "123456";

function handleResendModuleLevel(
  setCountdown: Dispatch<SetStateAction<number>>,
  setCode: Dispatch<SetStateAction<string>>,
  setStatus: Dispatch<SetStateAction<"idle" | "success">>,
) {
  setCountdown(30);
  setCode("");
  setStatus("idle");
}

function handleChangeModuleLevel(
  v: string,
  setCode: Dispatch<SetStateAction<string>>,
  setStatus: Dispatch<SetStateAction<"idle" | "success">>,
) {
  setCode(v);
  if (v === MOCK_CODE) {
    setStatus("success");
  } else {
    setStatus("idle");
  }
}

export function TwoFactorVerification() {
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [status, setStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleResend = useCallback(
    () => handleResendModuleLevel(setCountdown, setCode, setStatus),
    [setCountdown, setCode, setStatus],
  );

  const handleChange = useCallback(
    (v: string) => handleChangeModuleLevel(v, setCode, setStatus),
    [setCode, setStatus],
  );

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="bg-success/20 flex size-12 items-center justify-center rounded-full">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-success"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="text-fg text-sm font-semibold">Verified successfully</p>
        <p className="text-muted text-xs">Your identity has been confirmed.</p>
        <button
          onClick={() => {
            setCode("");
            setStatus("idle");
          }}
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
          Enter the 6-digit code sent to ****-****-
          <span className="tabular-nums">4321</span>
        </p>
      </div>
      <div className="flex justify-center">
        <InputOTP
          value={code}
          onChange={handleChange}
          maxLength={6}
          /* eslint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus
          description={
            code.length > 0 && code !== MOCK_CODE
              ? "Incorrect code — try 123456"
              : undefined
          }
          error={
            code.length > 0 && code !== MOCK_CODE ? "Invalid code" : undefined
          }
        />
      </div>
      <div className="flex items-center gap-2 text-xs">
        {countdown > 0 ? (
          <span className="text-muted">
            Resend in <span className="tabular-nums">{countdown}s</span>
          </span>
        ) : (
          <button onClick={handleResend} className="text-brand hover:underline">
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}
