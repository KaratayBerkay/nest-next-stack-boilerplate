"use client";

import { useState } from "react";
import { IconUserPlus, IconX } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithInviteUserMessages } from "@/types/pages/invite-user/InviteUserMessages-types";

interface Member {
  id: string;
  nameKey: string;
  emailKey: string;
  roleKey: string;
}

const MEMBERS: Member[] = [
  {
    id: "m1",
    nameKey: "inviteUser2Member1Name",
    emailKey: "inviteUser2Member1Email",
    roleKey: "inviteUser2RoleAdmin",
  },
  {
    id: "m2",
    nameKey: "inviteUser2Member2Name",
    emailKey: "inviteUser2Member2Email",
    roleKey: "inviteUser2RoleEditor",
  },
  {
    id: "m3",
    nameKey: "inviteUser2Member3Name",
    emailKey: "inviteUser2Member3Email",
    roleKey: "inviteUser2RoleEditor",
  },
  {
    id: "m4",
    nameKey: "inviteUser2Member4Name",
    emailKey: "inviteUser2Member4Email",
    roleKey: "inviteUser2RoleViewer",
  },
];

const ROLE_OPTIONS = [
  { value: "admin", labelKey: "inviteUser2RoleAdmin" },
  { value: "editor", labelKey: "inviteUser2RoleEditor" },
  { value: "viewer", labelKey: "inviteUser2RoleViewer" },
] as const;

interface PendingInvite {
  id: string;
  email: string;
}

export function AvatarGridSheetInviteUser() {
  const t = useMessages("pages") as unknown as PagesWithInviteUserMessages;
  const iu = t.inviteUser;

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<PendingInvite[]>([]);

  function handleSend() {
    if (!email.trim()) return;
    setPending((prev) => [...prev, { id: `${prev.length}-${email}`, email }]);
    setEmail("");
    setNote("");
    setRole("editor");
    setOpen(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-fg text-xl font-semibold tracking-tight">
              {iu.inviteUser2Heading}
            </h2>
            <p className="text-muted text-sm">{iu.inviteUser2Description}</p>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="primary"
                leftIcon={<IconUserPlus size={16} aria-hidden="true" />}
              >
                {iu.inviteUser2InviteButton}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col gap-6 overflow-y-auto"
            >
              <SheetHeader className="text-left">
                <SheetTitle>{iu.inviteUser2SheetTitle}</SheetTitle>
                <SheetDescription>
                  {iu.inviteUser2SheetDescription}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="iu2-email">{iu.inviteUser2EmailLabel}</Label>
                  <Input
                    id="iu2-email"
                    type="email"
                    value={email}
                    placeholder={iu.inviteUser2EmailPlaceholder}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{iu.inviteUser2RoleLabel}</Label>
                  <Select value={role} onValueChange={setRole} name="iu2-role">
                    <SelectTrigger>
                      <SelectValue
                        placeholder={iu.inviteUser2RoleSelectPlaceholder}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {iu[option.labelKey]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="iu2-note">{iu.inviteUser2NoteLabel}</Label>
                  <Textarea
                    id="iu2-note"
                    value={note}
                    placeholder={iu.inviteUser2NotePlaceholder}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="ghost">{iu.inviteUser2Cancel}</Button>
                </SheetClose>
                <Button
                  variant="primary"
                  onClick={handleSend}
                  disabled={!email.trim()}
                >
                  {iu.inviteUser2SendInvite}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MEMBERS.map((member) => (
            <Card key={member.id} variant="outline">
              <CardContent className="flex items-center gap-3 pt-4 @sm:pt-6">
                <Avatar fallback={iu[member.nameKey]} size="md" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-fg truncate text-sm font-medium">
                    {iu[member.nameKey]}
                  </span>
                  <span className="text-muted truncate text-xs">
                    {iu[member.emailKey]}
                  </span>
                </div>
                <Badge variant="soft">{iu[member.roleKey]}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-muted text-xs font-medium tracking-wider uppercase">
            {iu.inviteUser2PendingListTitle}
          </span>
          {pending.length === 0 ? (
            <p className="text-muted text-sm">
              {iu.inviteUser2PendingEmptyHint}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pending.map((invite) => (
                <Badge
                  key={invite.id}
                  variant="secondary"
                  className="gap-1.5 pr-1.5"
                >
                  {invite.email}
                  <button
                    type="button"
                    aria-label={iu.inviteUser2RemovePendingAria}
                    onClick={() =>
                      setPending((prev) =>
                        prev.filter((item) => item.id !== invite.id),
                      )
                    }
                    className="hover:bg-surface-hover ml-0.5 inline-flex size-4 items-center justify-center rounded-full"
                  >
                    <IconX size={11} aria-hidden="true" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
