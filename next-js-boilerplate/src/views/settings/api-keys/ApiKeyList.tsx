"use client";

import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { handleRevokeApiKey } from "./api-key-handlers";
import type { ApiKeyListProps } from "@/types/views/settings/ApiKeyList-types";

export function ApiKeyList({
  keys,
  loadingKeys,
  toast,
  loadKeys,
  revokeApiKey,
}: ApiKeyListProps) {
  const dateDisplay = useDateDisplayCookie();

  if (loadingKeys) {
    return <p className="text-muted text-sm">Loading...</p>;
  }

  if (keys.length === 0) {
    return (
      <p className="text-muted text-sm">
        No API keys yet. Create one to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {keys.map((key) => (
        <div
          key={key.id}
          className="surface flex items-center justify-between rounded-lg p-4"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{key.name}</span>
              <Badge variant={key.enabled ? "success" : "secondary"} pill>
                {key.enabled ? "Active" : "Disabled"}
              </Badge>
            </div>
            <code className="text-muted font-mono text-xs">
              {key.keyPrefix}...
            </code>
            <div className="text-muted flex gap-4 text-xs">
              <span>
                Created {formatDateByPreference(key.createdAt, dateDisplay)}
              </span>
              {key.lastUsedAt && (
                <span>
                  Last used{" "}
                  {formatDateByPreference(key.lastUsedAt, dateDisplay)}
                </span>
              )}
              {key.expiresAt && (
                <span>
                  Expires {formatDateByPreference(key.expiresAt, dateDisplay)}
                </span>
              )}
              {!key.expiresAt && <span>No expiry</span>}
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              handleRevokeApiKey(
                key.id,
                key.name,
                toast,
                loadKeys,
                revokeApiKey,
              )
            }
          >
            Revoke
          </Button>
        </div>
      ))}
    </div>
  );
}
