"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ApiKeyInfo } from "@/api/server/api-keys/list";

interface ApiKeyListProps {
  keys: ApiKeyInfo[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  revealedSecrets: Set<string>;
  onReveal: (id: string) => void;
  onCopy: (secret: string) => void;
  onRevoke: (id: string) => void;
}

export function ApiKeyList({
  keys,
  t,
  revealedSecrets,
  onReveal,
  onCopy,
  onRevoke,
}: ApiKeyListProps) {
  if (keys.length === 0) {
    return (
      <p className="text-muted py-8 text-center text-xs">{t.apiKey.empty}</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {keys.map((key) => (
        <div
          key={key.id}
          className="surface border-border flex flex-col gap-2 rounded-lg border p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{key.name}</span>
            <div className="flex gap-1.5">
              {!revealedSecrets.has(key.id) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReveal(key.id)}
                >
                  {t.apiKey.reveal}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(key.keyPrefix)}
                >
                  {t.apiKey.copy}
                </Button>
              )}
              <ConfirmDialog
                title={t.apiKey.revokeConfirm}
                description={t.apiKey.revokeConfirmDescription}
                confirmLabel={t.apiKey.revoke}
                onConfirm={() => onRevoke(key.id)}
              >
                {(open) => (
                  <Button size="sm" variant="destructive" onClick={open}>
                    {t.apiKey.revoke}
                  </Button>
                )}
              </ConfirmDialog>
            </div>
          </div>
          <div className="text-xxs text-muted flex items-center gap-3">
            <span>Created {key.createdAt}</span>
            {key.expiresAt && <span>Expires {key.expiresAt}</span>}
            {key.lastUsedAt && <span>Last used {key.lastUsedAt}</span>}
          </div>
          {revealedSecrets.has(key.id) && (
            <code className="bg-emphasis text-xxs block rounded p-2 break-all">
              {key.keyPrefix}_****
            </code>
          )}
        </div>
      ))}
    </div>
  );
}
