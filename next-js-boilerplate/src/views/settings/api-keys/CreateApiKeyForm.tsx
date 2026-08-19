"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { handleCreateApiKey } from "./api-key-handlers";
import type { CreateApiKeyFormProps } from "@/types/views/settings/CreateApiKeyForm-types";

export function CreateApiKeyForm({
  creating,
  setCreating,
  newName,
  setNewName,
  newExpiry,
  setNewExpiry,
  setNewKeyResult,
  toast,
  loadKeys,
  createApiKey,
  onCancel,
}: CreateApiKeyFormProps) {
  const t = useMessages("settings");

  const EXPIRY_OPTIONS = [
    { value: "", label: t.apiKeysNoExpiry },
    { value: "7", label: t.apiKeysExpiry7Days },
    { value: "30", label: t.apiKeysExpiry30Days },
    { value: "90", label: t.apiKeysExpiry90Days },
    { value: "365", label: t.apiKeysExpiry1Year },
  ];

  return (
    <div className="surface flex flex-col gap-3 rounded-lg p-4">
      <h3 className="font-semibold">{t.apiKeysCreateHeading}</h3>
      <Input
        placeholder={t.apiKeysNamePlaceholder}
        aria-label={t.apiKeysNameLabel}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        disabled={creating}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        {EXPIRY_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            disabled={creating}
            variant={newExpiry === opt.value ? "primary" : "outline"}
            size="xs"
            onClick={() => setNewExpiry(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() =>
            handleCreateApiKey(
              newName,
              setCreating,
              setNewKeyResult,
              toast,
              setNewName,
              setNewExpiry,
              loadKeys,
              newExpiry,
              createApiKey,
              t.apiKeysCreated,
              t.apiKeysCreateFailed,
            )
          }
          disabled={creating || !newName.trim()}
          size="sm"
        >
          {creating ? t.apiKeysCreating : t.apiKeysCreateSubmit}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          {t.apiKeysCancel}
        </Button>
      </div>
    </div>
  );
}
