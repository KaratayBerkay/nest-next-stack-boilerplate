"use client";

import { SocialLoginButton } from "./social-login-button";
import { useMessages } from "@/lib/i18n/MessagesProvider";

const allProviders = [
  { name: "google", label: "Google" },
  { name: "github", label: "GitHub" },
  { name: "x", label: "X" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "huggingface", label: "Hugging Face" },
  { name: "twitch", label: "Twitch" },
] as const;

export function SocialLoginButtons() {
  const t = useMessages("auth");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted text-xs">{t.social.continueWith}</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col gap-2">
        {allProviders.map((p) => (
          <SocialLoginButton key={p.name} provider={p.name} label={p.label} />
        ))}
      </div>
    </div>
  );
}
