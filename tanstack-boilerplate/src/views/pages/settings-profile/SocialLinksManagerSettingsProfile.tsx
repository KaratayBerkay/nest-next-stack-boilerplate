"use client";

import { useRef, useState } from "react";
import type { Icon } from "@tabler/icons-react";
import {
  IconBrandX,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandInstagram,
  IconWorld,
  IconPlus,
  IconTrash,
  IconLink,
} from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Empty } from "@/components/ui/Empty";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

type SocialPlatform = "twitter" | "github" | "linkedin" | "instagram" | "website";

interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export function SocialLinksManagerSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const platformOptions: Array<{ value: SocialPlatform; icon: Icon; label: string }> = [
    { value: "twitter", icon: IconBrandX, label: sp.settingsProfile8PlatformTwitter },
    { value: "github", icon: IconBrandGithub, label: sp.settingsProfile8PlatformGithub },
    { value: "linkedin", icon: IconBrandLinkedin, label: sp.settingsProfile8PlatformLinkedin },
    { value: "instagram", icon: IconBrandInstagram, label: sp.settingsProfile8PlatformInstagram },
    { value: "website", icon: IconWorld, label: sp.settingsProfile8PlatformWebsite },
  ];

  function platformMeta(platform: SocialPlatform) {
    return platformOptions.find((option) => option.value === platform) ?? platformOptions[0];
  }

  const [links, setLinks] = useState<SocialLink[]>([
    { id: "seed-1", platform: "twitter", url: sp.settingsProfile8SeedTwitterUrl },
    { id: "seed-2", platform: "github", url: sp.settingsProfile8SeedGithubUrl },
    { id: "seed-3", platform: "website", url: sp.settingsProfile8SeedWebsiteUrl },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const nextIdRef = useRef(4);

  function handleAdd() {
    const id = `link-${nextIdRef.current}`;
    nextIdRef.current += 1;
    setLinks((prev) => [...prev, { id, platform: "website", url: "" }]);
    setSaved(false);
  }

  function handleRemove(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    setSaved(false);
  }

  function handlePlatformChange(id: string, platform: SocialPlatform) {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, platform } : link)));
    setSaved(false);
  }

  function handleUrlChange(id: string, url: string) {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, url } : link)));
    setSaved(false);
  }

  function handleSave() {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1200);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6 lg:px-8">
        <div className="border-border bg-bg rounded-xl border p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-fg text-lg font-semibold tracking-tight">
                {sp.settingsProfile8Heading}
              </h2>
              <p className="text-muted mt-1 text-sm">{sp.settingsProfile8Subheading}</p>
            </div>
            <IconLink size={18} className="text-muted mt-1 shrink-0" aria-hidden="true" />
          </div>

          {links.length === 0 ? (
            <Empty
              icon={<IconWorld size={28} aria-hidden="true" />}
              title={sp.settingsProfile8EmptyTitle}
              description={sp.settingsProfile8EmptyText}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {links.map((link) => {
                const meta = platformMeta(link.platform);
                const PlatformIcon = meta.icon;
                return (
                  <div key={link.id} className="flex items-center gap-2">
                    <PlatformIcon size={16} className="text-muted hidden shrink-0 sm:block" aria-hidden="true" />
                    <NativeSelect
                      value={link.platform}
                      onChange={(e) =>
                        handlePlatformChange(link.id, e.target.value as SocialPlatform)
                      }
                      aria-label={sp.settingsProfile8PlatformSelectAria}
                      className="w-32 shrink-0 sm:w-36"
                    >
                      {platformOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </NativeSelect>
                    <Input
                      value={link.url}
                      onChange={(e) => handleUrlChange(link.id, e.target.value)}
                      placeholder={sp.settingsProfile8UrlPlaceholder}
                      aria-label={`${meta.label} ${sp.settingsProfile8UrlFieldLabel}`}
                      className="min-w-0 flex-1"
                    />
                    <IconButton
                      icon={<IconTrash size={14} aria-hidden="true" />}
                      label={`${sp.settingsProfile8RemoveAria} ${meta.label}`}
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleRemove(link.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            className="mt-4"
            leftIcon={<IconPlus size={15} aria-hidden="true" />}
            onClick={handleAdd}
          >
            {sp.settingsProfile8AddButton}
          </Button>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            {saved && (
              <span className="text-success mr-auto text-xs">{sp.settingsProfile8SavedText}</span>
            )}
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {sp.settingsProfile8SaveButton}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
