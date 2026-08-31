"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";
import type { UploadFile, FileUploadLabels } from "@/types/ui/FileUpload-types";

const BIO_MAX_LENGTH = 160;

export function CenteredAvatarCardSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [avatar, setAvatar] = useState<UploadFile[]>([]);
  const [name, setName] = useState(sp.settingsProfile2NameValue);
  const [username, setUsername] = useState(sp.settingsProfile2UsernameValue);
  const [bio, setBio] = useState(sp.settingsProfile2BioValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const uploadLabels: FileUploadLabels = {
    changePhoto: sp.settingsProfile2ChangePhoto,
    removePhoto: sp.settingsProfile2RemovePhoto,
    uploading: sp.settingsProfile2Uploading,
    uploadFailed: sp.settingsProfile2UploadFailed,
    invalidTypeTitle: sp.settingsProfile2InvalidTypeTitle,
    invalidType: (file, accepted) =>
      sp.settingsProfile2InvalidType
        .replace("{file}", file)
        .replace("{accepted}", accepted),
    acceptedTypesText: (accept) =>
      sp.settingsProfile2AcceptedTypes.replace("{accept}", accept),
  };

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
      <div className="mx-auto max-w-sm px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{sp.settingsProfile2CardHeading}</CardTitle>
            <CardDescription>
              {sp.settingsProfile2CardSubheading}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex justify-center">
              <ImageUpload
                avatar
                value={avatar}
                onChange={setAvatar}
                labels={uploadLabels}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cac-name">{sp.settingsProfile2NameLabel}</Label>
              <Input
                id="cac-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cac-username">
                {sp.settingsProfile2UsernameLabel}
              </Label>
              <Input
                id="cac-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="cac-bio">{sp.settingsProfile2BioLabel}</Label>
                <span className="text-muted text-xs">
                  {bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="cac-bio"
                value={bio}
                maxLength={BIO_MAX_LENGTH}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            {saved && (
              <span className="text-success mr-auto text-xs">
                {sp.settingsProfile2SavedText}
              </span>
            )}
            <Button variant="ghost" disabled={saving}>
              {sp.settingsProfile2CancelButton}
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {sp.settingsProfile2SaveButton}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
