"use client";

import { useState } from "react";
import Image from "next/image";
import { IconCamera, IconLink, IconMapPin } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

const COVER_SEEDS = ["cover-header-a", "cover-header-b", "cover-header-c"];

export function CoverHeaderSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [coverIndex, setCoverIndex] = useState(0);
  const [name, setName] = useState(sp.settingsProfile1NameValue);
  const [bio, setBio] = useState(sp.settingsProfile1BioValue);
  const [location, setLocation] = useState(sp.settingsProfile1LocationValue);
  const [website, setWebsite] = useState(sp.settingsProfile1WebsiteValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function cycleCover() {
    setCoverIndex((prev) => (prev + 1) % COVER_SEEDS.length);
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
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="border-border overflow-hidden rounded-xl border">
          <div className="relative h-36 w-full sm:h-44">
            <Image
              src={placeholderImage(COVER_SEEDS[coverIndex], "2x1")}
              alt={sp.settingsProfile1CoverAlt}
              fill
              sizes="(min-width: 640px) 42rem, 100vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={cycleCover}
              aria-label={sp.settingsProfile1EditCoverAria}
              className="bg-bg/80 text-fg hover:bg-bg absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-xs transition-colors"
            >
              <IconCamera size={14} aria-hidden="true" />
              {sp.settingsProfile1EditCoverAria}
            </button>
          </div>
          <div className="bg-surface flex flex-col gap-5 px-6 pt-0 pb-6">
            <div className="relative -mt-10 flex items-end justify-between">
              <div className="relative">
                <Avatar
                  src={placeholderImage(`${COVER_SEEDS[coverIndex]}-avatar`, "1x1")}
                  alt={name}
                  fallback={name || "?"}
                  size="xl"
                  className="border-bg border-4"
                />
                <button
                  type="button"
                  onClick={cycleCover}
                  aria-label={sp.settingsProfile1EditAvatarAria}
                  className="bg-brand text-brand-fg border-bg absolute right-0 bottom-0 inline-flex size-6 items-center justify-center rounded-full border-2"
                >
                  <IconCamera size={12} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="ch-name">{sp.settingsProfile1NameLabel}</Label>
                <span className="text-muted text-sm">{sp.settingsProfile1Handle}</span>
              </div>
              <Input id="ch-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ch-bio">{sp.settingsProfile1BioLabel}</Label>
              <Textarea
                id="ch-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ch-location">{sp.settingsProfile1LocationLabel}</Label>
                <Input
                  id="ch-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  leftIcon={<IconMapPin size={16} aria-hidden="true" />}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ch-website">{sp.settingsProfile1WebsiteLabel}</Label>
                <Input
                  id="ch-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  leftIcon={<IconLink size={16} aria-hidden="true" />}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {saved && (
                <span className="text-success text-xs">{sp.settingsProfile1SavedBadge}</span>
              )}
              <Button variant="primary" loading={saving} onClick={handleSave}>
                {saving ? sp.settingsProfile1SavingButton : sp.settingsProfile1SaveButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
