"use client";

import { useState } from "react";
import { IconBriefcase, IconMapPin } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

type AccentId = "brand" | "info" | "success" | "warning" | "error";

interface AccentSwatch {
  id: AccentId;
  swatchClass: string;
  barClass: string;
  nameKey: string;
}

const SWATCHES: AccentSwatch[] = [
  {
    id: "brand",
    swatchClass: "bg-brand",
    barClass: "bg-brand",
    nameKey: "settingsProfile3AccentBrand",
  },
  {
    id: "info",
    swatchClass: "bg-info",
    barClass: "bg-info",
    nameKey: "settingsProfile3AccentInfo",
  },
  {
    id: "success",
    swatchClass: "bg-success",
    barClass: "bg-success",
    nameKey: "settingsProfile3AccentSuccess",
  },
  {
    id: "warning",
    swatchClass: "bg-warning",
    barClass: "bg-warning",
    nameKey: "settingsProfile3AccentWarning",
  },
  {
    id: "error",
    swatchClass: "bg-error",
    barClass: "bg-error",
    nameKey: "settingsProfile3AccentError",
  },
];

export function LivePreviewSplitSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [name, setName] = useState(sp.settingsProfile3NameValue);
  const [role, setRole] = useState(sp.settingsProfile3RoleValue);
  const [bio, setBio] = useState(sp.settingsProfile3BioValue);
  const [location, setLocation] = useState(sp.settingsProfile3LocationValue);
  const [accent, setAccent] = useState<AccentId>("brand");

  const activeSwatch = SWATCHES.find((s) => s.id === accent) ?? SWATCHES[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="flex flex-col gap-5">
          <h2 className="text-fg text-xl font-semibold tracking-tight">
            {sp.settingsProfile3FormHeading}
          </h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lps-name">{sp.settingsProfile3NameLabel}</Label>
            <Input
              id="lps-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lps-role">{sp.settingsProfile3RoleLabel}</Label>
            <Input
              id="lps-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              leftIcon={<IconBriefcase size={16} aria-hidden="true" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lps-location">
              {sp.settingsProfile3LocationLabel}
            </Label>
            <Input
              id="lps-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<IconMapPin size={16} aria-hidden="true" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lps-bio">{sp.settingsProfile3BioLabel}</Label>
            <Textarea
              id="lps-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-fg text-sm font-medium">
              {sp.settingsProfile3AccentLabel}
            </span>
            <div className="flex gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => setAccent(swatch.id)}
                  aria-label={`${sp.settingsProfile3AccentAriaPrefix} ${sp[swatch.nameKey]}`}
                  aria-pressed={accent === swatch.id}
                  className={`size-7 rounded-full ${swatch.swatchClass} ${
                    accent === swatch.id
                      ? "ring-brand ring-offset-bg ring-2 ring-offset-2"
                      : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <span className="text-muted mb-2 block text-xs font-medium tracking-wide uppercase">
            {sp.settingsProfile3PreviewHeading}
          </span>
          <Card className="overflow-hidden">
            <div className={`h-2 w-full ${activeSwatch.barClass}`} />
            <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
              <Avatar
                fallback={name || "?"}
                size="xl"
                variant={activeSwatch.id}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-fg text-base font-semibold">{name}</span>
                <span className="text-muted text-sm">{role}</span>
              </div>
              {bio && <p className="text-muted text-sm">{bio}</p>}
              {location && (
                <span className="text-muted inline-flex items-center gap-1 text-xs">
                  <IconMapPin size={12} aria-hidden="true" />
                  {location}
                </span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
