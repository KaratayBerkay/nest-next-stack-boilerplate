import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { Button } from "@/components/ui/Button";

export function NotificationSettingsTab() {
  const [prefs, setPrefs] = useState({
    push: true,
    emailDigest: false,
    sms: true,
    marketing: false,
  });

  return (
    <div className="max-w-md space-y-6">
      <div className="surface divide-border divide-y overflow-hidden rounded-lg">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="push">Push Notifications</Label>
            <p className="text-muted text-xs">
              Get instant alerts for important updates and mentions
            </p>
          </div>
          <Switch
            id="push"
            checked={prefs.push}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, push: e.target.checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="emailDigest">Email Digest</Label>
            <p className="text-muted text-xs">
              Receive a weekly summary of your activity and top stories
            </p>
          </div>
          <Switch
            id="emailDigest"
            checked={prefs.emailDigest}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, emailDigest: e.target.checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="sms">SMS Alerts</Label>
            <p className="text-muted text-xs">
              Get text messages for critical system alerts and outages
            </p>
          </div>
          <Switch
            id="sms"
            checked={prefs.sms}
            onChange={(e) => setPrefs((s) => ({ ...s, sms: e.target.checked }))}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing Emails</Label>
            <p className="text-muted text-xs">
              Stay informed about new features, tips, and promotions
            </p>
          </div>
          <Switch
            id="marketing"
            checked={prefs.marketing}
            onChange={(e) =>
              setPrefs((s) => ({ ...s, marketing: e.target.checked }))
            }
          />
        </div>
      </div>
      <Separator />
      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}
