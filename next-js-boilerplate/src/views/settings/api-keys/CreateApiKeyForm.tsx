"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { handleCreateApiKey } from "./api-key-handlers";
import type { useToast } from "@/components/ui/Toast";
import type { useApiKeyActions } from "@/api/client/api-keys/actions";
import type { Dispatch, SetStateAction } from "react";

type ToastFn = ReturnType<typeof useToast>["toast"];
type CreateApiKey = ReturnType<typeof useApiKeyActions>["createApiKey"];

interface CreateApiKeyFormProps {
  creating: boolean;
  setCreating: Dispatch<SetStateAction<boolean>>;
  newName: string;
  setNewName: Dispatch<SetStateAction<string>>;
  newExpiry: string;
  setNewExpiry: Dispatch<SetStateAction<string>>;
  setNewKeyResult: Dispatch<SetStateAction<string | null>>;
  toast: ToastFn;
  loadKeys: () => Promise<void>;
  createApiKey: CreateApiKey;
  onCancel: () => void;
}

const EXPIRY_OPTIONS = [
  { value: "", label: "No expiry" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
];

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
  return (
    <div className="surface flex flex-col gap-3 rounded-lg p-4">
      <h3 className="font-semibold">Create new API key</h3>
      <Input
        placeholder="Key name (e.g. 'CI/CD', 'Development')"
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
            )
          }
          disabled={creating || !newName.trim()}
          size="sm"
        >
          {creating ? "Creating..." : "Create"}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
