"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconLink, IconSend2 } from "@tabler/icons-react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithInviteUserMessages } from "@/types/pages/invite-user/InviteUserMessages-types";

const MEMBER_NAME_KEYS = [
  "inviteUser4Member1Name",
  "inviteUser4Member2Name",
  "inviteUser4Member3Name",
  "inviteUser4Member4Name",
  "inviteUser4Member5Name",
] as const;

const PERMISSION_OPTIONS = [
  { value: "editor", labelKey: "inviteUser4PermissionEditor" },
  { value: "viewer", labelKey: "inviteUser4PermissionViewer" },
] as const;

export function ShareLinkDialogInviteUser() {
  const t = useMessages("pages") as unknown as PagesWithInviteUserMessages;
  const iu = t.inviteUser;

  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState("editor");
  const [copied, setCopied] = useState(false);
  const [quickEmail, setQuickEmail] = useState("");
  const [sentTo, setSentTo] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(iu.inviteUser4LinkValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleQuickSend() {
    if (!quickEmail.trim()) return;
    setSentTo(quickEmail);
    setQuickEmail("");
    setTimeout(() => setSentTo(""), 2500);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 lg:px-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger variant="primary">
            <IconLink size={15} className="mr-1.5" aria-hidden="true" />
            {iu.inviteUser4TriggerButton}
          </DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>{iu.inviteUser4DialogTitle}</DialogTitle>
              <DialogDescription>{iu.inviteUser4DialogDescription}</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-muted text-xs font-medium tracking-wide uppercase">
                  {iu.inviteUser4MembersLabel}
                </span>
                <AvatarGroup max={3}>
                  {MEMBER_NAME_KEYS.map((key) => (
                    <Avatar key={key} fallback={iu[key]} size="sm" />
                  ))}
                </AvatarGroup>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{iu.inviteUser4PermissionLabel}</Label>
                <Select value={permission} onValueChange={setPermission} name="iu4-permission">
                  <SelectTrigger>
                    <SelectValue placeholder={iu.inviteUser4PermissionSelectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {iu[option.labelKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="iu4-link">{iu.inviteUser4LinkLabel}</Label>
                <div className="border-border bg-surface flex items-center gap-2 rounded-xl border p-1.5 pl-3 shadow-xs">
                  <input
                    id="iu4-link"
                    readOnly
                    value={iu.inviteUser4LinkValue}
                    className="text-fg min-w-0 flex-1 truncate bg-transparent text-sm outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    aria-label={iu.inviteUser4CopyAria}
                    onClick={handleCopy}
                    leftIcon={
                      copied ? (
                        <IconCheck size={14} aria-hidden="true" />
                      ) : (
                        <IconCopy size={14} aria-hidden="true" />
                      )
                    }
                  >
                    {copied ? iu.inviteUser4CopiedButton : iu.inviteUser4CopyButton}
                  </Button>
                </div>
              </div>

              <Separator label={iu.inviteUser4Divider} />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={quickEmail}
                    placeholder={iu.inviteUser4EmailPlaceholder}
                    onChange={(event) => setQuickEmail(event.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="icon"
                    aria-label={iu.inviteUser4EmailSendAria}
                    onClick={handleQuickSend}
                    disabled={!quickEmail.trim()}
                  >
                    <IconSend2 size={14} aria-hidden="true" />
                  </Button>
                </div>
                {sentTo && (
                  <span className="text-success text-xs">
                    {iu.inviteUser4SentPrefix} {sentTo}
                  </span>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose variant="primary">{iu.inviteUser4Done}</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
