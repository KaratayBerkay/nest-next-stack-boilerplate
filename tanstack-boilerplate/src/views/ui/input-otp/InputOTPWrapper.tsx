"use client";
import { useState } from "react";
import { InputOTP } from "@/components/ui/InputOTP";

export function InputOTPWrapper() {
  const [val, setVal] = useState("");
  return <InputOTP value={val} onChange={setVal} maxLength={6} />;
}
