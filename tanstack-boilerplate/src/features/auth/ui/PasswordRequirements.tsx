"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  passwordRuleChecks,
  passwordRuleOrder,
} from "@/validators/auth/password-policy";
import type { PasswordRequirementsProps } from "@/types/auth/PasswordRequirements-types";

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const t = useMessages("auth");

  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted text-xs">{t.passwordRules.heading}</p>
      <ul className="flex flex-col gap-0.5">
        {passwordRuleOrder.map((key) => {
          const met = passwordRuleChecks[key](password);
          return (
            <li
              key={key}
              className={`flex items-center gap-1.5 text-xs ${met ? "text-success" : "text-muted"}`}
            >
              {met ? (
                <IconCheck size={14} className="shrink-0" />
              ) : (
                <IconX size={14} className="shrink-0" />
              )}
              {t.passwordRules[key]}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
