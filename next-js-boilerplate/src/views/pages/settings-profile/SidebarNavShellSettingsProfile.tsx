"use client";

import { useState } from "react";
import {
  IconUserCircle,
  IconAdjustments,
  IconShieldLock,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

type SectionId = "profile" | "preferences" | "security";
type Visibility = "everyone" | "friends" | "onlyMe";

export function SidebarNavShellSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [section, setSection] = useState<SectionId>("profile");
  const [displayName, setDisplayName] = useState(sp.settingsProfile5NameValue);
  const [bio, setBio] = useState(sp.settingsProfile5BioValue);
  const [emailDigest, setEmailDigest] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("friends");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-fg text-xl font-semibold tracking-tight">
            {sp.settingsProfile5Title}
          </h2>
          <p className="text-muted mt-1 text-sm">
            {sp.settingsProfile5Subtitle}
          </p>
        </div>

        <div className="border-border overflow-hidden rounded-xl border md:grid md:grid-cols-[200px_1fr]">
          <nav className="bg-surface md:border-border flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible md:border-r">
            <button
              type="button"
              onClick={() => setSection("profile")}
              aria-current={section === "profile" ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                section === "profile"
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              <IconUserCircle size={16} aria-hidden="true" />
              {sp.settingsProfile5NavProfileLabel}
            </button>
            <button
              type="button"
              onClick={() => setSection("preferences")}
              aria-current={section === "preferences" ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                section === "preferences"
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              <IconAdjustments size={16} aria-hidden="true" />
              {sp.settingsProfile5NavPreferencesLabel}
            </button>
            <button
              type="button"
              onClick={() => setSection("security")}
              aria-current={section === "security" ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                section === "security"
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-surface-hover hover:text-fg",
              )}
            >
              <IconShieldLock size={16} aria-hidden="true" />
              {sp.settingsProfile5NavSecurityLabel}
            </button>
          </nav>

          <div className="bg-bg flex flex-col gap-5 p-6">
            {section === "profile" && (
              <>
                <h3 className="text-fg text-sm font-semibold">
                  {sp.settingsProfile5ProfileSectionHeading}
                </h3>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sns-name">
                    {sp.settingsProfile5NameLabel}
                  </Label>
                  <Input
                    id="sns-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sns-bio">{sp.settingsProfile5BioLabel}</Label>
                  <Textarea
                    id="sns-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </>
            )}

            {section === "preferences" && (
              <>
                <h3 className="text-fg text-sm font-semibold">
                  {sp.settingsProfile5PreferencesSectionHeading}
                </h3>
                <Switch
                  label={sp.settingsProfile5EmailDigestLabel}
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                />
                <Switch
                  label={sp.settingsProfile5PublicProfileLabel}
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-fg text-sm font-medium">
                    {sp.settingsProfile5VisibilityLabel}
                  </span>
                  <RadioGroup
                    value={visibility}
                    onValueChange={(value) =>
                      setVisibility(value as Visibility)
                    }
                    className="flex flex-col gap-2"
                  >
                    <label
                      htmlFor="sns-visibility-everyone"
                      className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors"
                    >
                      <RadioGroupItem
                        value="everyone"
                        id="sns-visibility-everyone"
                      />
                      {sp.settingsProfile5VisibilityEveryone}
                    </label>
                    <label
                      htmlFor="sns-visibility-friends"
                      className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors"
                    >
                      <RadioGroupItem
                        value="friends"
                        id="sns-visibility-friends"
                      />
                      {sp.settingsProfile5VisibilityFriends}
                    </label>
                    <label
                      htmlFor="sns-visibility-only-me"
                      className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors"
                    >
                      <RadioGroupItem
                        value="onlyMe"
                        id="sns-visibility-only-me"
                      />
                      {sp.settingsProfile5VisibilityOnlyMe}
                    </label>
                  </RadioGroup>
                </div>
              </>
            )}

            {section === "security" && (
              <>
                <h3 className="text-fg text-sm font-semibold">
                  {sp.settingsProfile5SecuritySectionHeading}
                </h3>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sns-current-password">
                    {sp.settingsProfile5CurrentPasswordLabel}
                  </Label>
                  <Input
                    id="sns-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sns-new-password">
                    {sp.settingsProfile5NewPasswordLabel}
                  </Label>
                  <Input
                    id="sns-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <Switch
                  label={sp.settingsProfile5TwoFactorLabel}
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                />
              </>
            )}

            <div className="border-border mt-2 flex items-center justify-end gap-3 border-t pt-4">
              {saved && (
                <span className="text-success mr-auto text-xs">
                  {sp.settingsProfile5SavedText}
                </span>
              )}
              <Button variant="primary" loading={saving} onClick={handleSave}>
                {sp.settingsProfile5SaveButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
