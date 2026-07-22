"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";

function ProfilePanel() {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="settings-name">Name</Label>
        <Input id="settings-name" defaultValue="Jane Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-email">Email</Label>
        <Input
          id="settings-email"
          type="email"
          defaultValue="jane@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-avatar">Avatar</Label>
        <Input id="settings-avatar" type="file" />
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="settings-current-password">Current Password</Label>
        <Input id="settings-current-password" type="password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="settings-new-password">New Password</Label>
        <Input id="settings-new-password" type="password" />
      </div>
      <Button>Update Password</Button>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="settings-email-notif">Email notifications</Label>
        <Switch id="settings-email-notif" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="settings-push-notif">Push notifications</Label>
        <Switch id="settings-push-notif" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="settings-sms-notif">SMS notifications</Label>
        <Switch id="settings-sms-notif" />
      </div>
    </div>
  );
}

export function SettingsSectionsTab() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfilePanel />
      </TabsContent>
      <TabsContent value="security">
        <SecurityPanel />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsPanel />
      </TabsContent>
    </Tabs>
  );
}
