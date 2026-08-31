"use client";

import { useState } from "react";
import {
  IconMail,
  IconPhone,
  IconWorld,
  IconBrandX,
} from "@tabler/icons-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

interface ProfileFormValues {
  displayName: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  twitter: string;
}

export function TabbedSectionsSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [values, setValues] = useState<ProfileFormValues>({
    displayName: sp.settingsProfile4DisplayNameValue,
    username: sp.settingsProfile4UsernameValue,
    bio: sp.settingsProfile4BioValue,
    email: sp.settingsProfile4EmailValue,
    phone: sp.settingsProfile4PhoneValue,
    website: sp.settingsProfile4WebsiteValue,
    twitter: sp.settingsProfile4TwitterValue,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateField<K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{sp.settingsProfile4CardHeading}</CardTitle>
            <CardDescription>
              {sp.settingsProfile4CardSubheading}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">
                  {sp.settingsProfile4TabProfile}
                </TabsTrigger>
                <TabsTrigger value="contact">
                  {sp.settingsProfile4TabContact}
                </TabsTrigger>
                <TabsTrigger value="social">
                  {sp.settingsProfile4TabSocial}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-display-name">
                    {sp.settingsProfile4DisplayNameLabel}
                  </Label>
                  <Input
                    id="ts-display-name"
                    value={values.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-username">
                    {sp.settingsProfile4UsernameLabel}
                  </Label>
                  <Input
                    id="ts-username"
                    value={values.username}
                    onChange={(e) => updateField("username", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-bio">{sp.settingsProfile4BioLabel}</Label>
                  <Textarea
                    id="ts-bio"
                    rows={3}
                    value={values.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-email">
                    {sp.settingsProfile4EmailLabel}
                  </Label>
                  <Input
                    id="ts-email"
                    type="email"
                    value={values.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    leftIcon={<IconMail size={16} aria-hidden="true" />}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-phone">
                    {sp.settingsProfile4PhoneLabel}
                  </Label>
                  <Input
                    id="ts-phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    leftIcon={<IconPhone size={16} aria-hidden="true" />}
                  />
                </div>
              </TabsContent>

              <TabsContent value="social" className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-website">
                    {sp.settingsProfile4WebsiteLabel}
                  </Label>
                  <Input
                    id="ts-website"
                    value={values.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    leftIcon={<IconWorld size={16} aria-hidden="true" />}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ts-twitter">
                    {sp.settingsProfile4TwitterLabel}
                  </Label>
                  <Input
                    id="ts-twitter"
                    value={values.twitter}
                    onChange={(e) => updateField("twitter", e.target.value)}
                    leftIcon={<IconBrandX size={16} aria-hidden="true" />}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            {saved && (
              <span className="text-success mr-auto text-xs">
                {sp.settingsProfile4SavedText}
              </span>
            )}
            <Button variant="primary" loading={saving} onClick={handleSave}>
              {sp.settingsProfile4SaveButton}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
