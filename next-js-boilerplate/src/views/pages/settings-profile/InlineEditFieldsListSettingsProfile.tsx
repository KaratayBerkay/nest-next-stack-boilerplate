"use client";

import { useState } from "react";
import type { Icon } from "@tabler/icons-react";
import {
  IconUser,
  IconMail,
  IconAt,
  IconMapPin,
  IconPencil,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

interface FieldValues {
  name: string;
  email: string;
  username: string;
  location: string;
}

export function InlineEditFieldsListSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [values, setValues] = useState<FieldValues>({
    name: sp.settingsProfile6NameValue,
    email: sp.settingsProfile6EmailValue,
    username: sp.settingsProfile6UsernameValue,
    location: sp.settingsProfile6LocationValue,
  });
  const [editingKey, setEditingKey] = useState<keyof FieldValues | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const fields: Array<{ key: keyof FieldValues; label: string; icon: Icon }> = [
    { key: "name", label: sp.settingsProfile6NameLabel, icon: IconUser },
    { key: "email", label: sp.settingsProfile6EmailLabel, icon: IconMail },
    { key: "username", label: sp.settingsProfile6UsernameLabel, icon: IconAt },
    {
      key: "location",
      label: sp.settingsProfile6LocationLabel,
      icon: IconMapPin,
    },
  ];

  function handleStartEdit(key: keyof FieldValues) {
    setDraftValue(values[key]);
    setEditingKey(key);
  }

  function handleSaveRow() {
    if (!editingKey) return;
    const key = editingKey;
    setValues((prev) => ({ ...prev, [key]: draftValue }));
    setEditingKey(null);
  }

  function handleCancelRow() {
    setEditingKey(null);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <div className="border-border bg-bg rounded-xl border">
          <div className="border-border border-b px-6 py-5">
            <h2 className="text-fg text-lg font-semibold tracking-tight">
              {sp.settingsProfile6Heading}
            </h2>
            <p className="text-muted mt-1 text-sm">
              {sp.settingsProfile6Subheading}
            </p>
          </div>

          <div className="flex flex-col px-6">
            {fields.map((field) => {
              const isEditing = editingKey === field.key;
              const FieldIcon = field.icon;
              return (
                <div
                  key={field.key}
                  className="border-border flex items-center justify-between gap-4 border-b py-4 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FieldIcon
                      size={16}
                      className="text-muted shrink-0"
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-muted text-xs">{field.label}</span>
                      {isEditing ? (
                        <Input
                          value={draftValue}
                          onChange={(e) => setDraftValue(e.target.value)}
                          aria-label={field.label}
                          className="h-8"
                        />
                      ) : (
                        <span className="text-fg truncate text-sm font-medium">
                          {values[field.key]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {isEditing ? (
                      <>
                        <IconButton
                          icon={<IconCheck size={14} aria-hidden="true" />}
                          label={`${sp.settingsProfile6SaveAria} ${field.label}`}
                          size="icon-sm"
                          variant="ghost"
                          onClick={handleSaveRow}
                        />
                        <IconButton
                          icon={<IconX size={14} aria-hidden="true" />}
                          label={sp.settingsProfile6CancelAria}
                          size="icon-sm"
                          variant="ghost"
                          onClick={handleCancelRow}
                        />
                      </>
                    ) : (
                      <IconButton
                        icon={<IconPencil size={14} aria-hidden="true" />}
                        label={`${sp.settingsProfile6EditAria} ${field.label}`}
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(field.key)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
