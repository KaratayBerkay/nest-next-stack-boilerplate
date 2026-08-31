"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconDownload,
  IconKey,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithTwoFactorMessages } from "@/types/pages/two-factor/TwoFactorMessages-types";

interface BackupCodeItem {
  id: string;
  codeKey: string;
}

const BACKUP_CODES: BackupCodeItem[] = [
  { id: "code-1", codeKey: "twoFactor6Code1" },
  { id: "code-2", codeKey: "twoFactor6Code2" },
  { id: "code-3", codeKey: "twoFactor6Code3" },
  { id: "code-4", codeKey: "twoFactor6Code4" },
  { id: "code-5", codeKey: "twoFactor6Code5" },
  { id: "code-6", codeKey: "twoFactor6Code6" },
  { id: "code-7", codeKey: "twoFactor6Code7" },
  { id: "code-8", codeKey: "twoFactor6Code8" },
];

function handleCopyAll(setCopied: Dispatch<SetStateAction<boolean>>) {
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

function handleDownload(setDownloaded: Dispatch<SetStateAction<boolean>>) {
  setDownloaded(true);
  setTimeout(() => setDownloaded(false), 2000);
}

function handleContinue(
  setEnabling: Dispatch<SetStateAction<boolean>>,
  setEnabled: Dispatch<SetStateAction<boolean>>,
) {
  setEnabling(true);
  setTimeout(() => {
    setEnabling(false);
    setEnabled(true);
  }, 700);
}

function handleRegenerate(
  setEnabled: Dispatch<SetStateAction<boolean>>,
  setConfirmed: Dispatch<SetStateAction<boolean>>,
) {
  setEnabled(false);
  setConfirmed(false);
}

export function RecoveryCodesTwoFactor() {
  const t = useMessages("pages") as unknown as PagesWithTwoFactorMessages;
  const tf = t.twoFactor;

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [enabled, setEnabled] = useState(false);

  return (
    <section className="flex w-full items-center justify-center px-4 py-16">
      <Card variant="elevated" className="w-full max-w-lg">
        <CardHeader className="items-center gap-4 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <IconKey size={22} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl">{tf.twoFactor6Title}</CardTitle>
            <CardDescription>{tf.twoFactor6Description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {enabled ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
                <IconShieldCheck size={26} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-fg text-sm font-medium">
                  {tf.twoFactor6SuccessTitle}
                </p>
                <p className="text-muted text-sm">{tf.twoFactor6SuccessBody}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRegenerate(setEnabled, setConfirmed)}
              >
                {tf.twoFactor6RegenerateAction}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <Alert variant="warning" className="flex items-start gap-2.5">
                <IconAlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{tf.twoFactor6WarningText}</span>
              </Alert>

              <ul
                aria-label={tf.twoFactor6CodesListAria}
                className="grid grid-cols-2 gap-2"
              >
                {BACKUP_CODES.map((item) => (
                  <li
                    key={item.id}
                    className="border-border bg-surface text-fg rounded-md border px-3 py-2 text-center font-mono text-sm"
                  >
                    {tf[item.codeKey]}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={
                    copied ? (
                      <IconCheck size={14} aria-hidden="true" />
                    ) : (
                      <IconCopy size={14} aria-hidden="true" />
                    )
                  }
                  onClick={() => handleCopyAll(setCopied)}
                >
                  {copied
                    ? tf.twoFactor6CopiedAllAction
                    : tf.twoFactor6CopyAllAction}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  leftIcon={
                    downloaded ? (
                      <IconCheck size={14} aria-hidden="true" />
                    ) : (
                      <IconDownload size={14} aria-hidden="true" />
                    )
                  }
                  onClick={() => handleDownload(setDownloaded)}
                >
                  {downloaded
                    ? tf.twoFactor6DownloadedAction
                    : tf.twoFactor6DownloadAction}
                </Button>
              </div>

              <Checkbox
                id="tf6-confirm"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                label={tf.twoFactor6ConfirmLabel}
              />

              <Button
                type="button"
                variant="primary"
                className="w-full"
                disabled={!confirmed}
                loading={enabling}
                onClick={() => handleContinue(setEnabling, setEnabled)}
              >
                {tf.twoFactor6ContinueAction}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
