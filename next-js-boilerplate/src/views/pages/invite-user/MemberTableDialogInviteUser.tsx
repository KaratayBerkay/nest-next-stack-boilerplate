"use client";

import { useState } from "react";
import { IconCrown, IconTrash, IconUserPlus } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithInviteUserMessages } from "@/types/pages/invite-user/InviteUserMessages-types";

interface MemberRow {
  id: string;
  nameKey?: string;
  emailKey?: string;
  email?: string;
  roleKey: string;
  statusKey: string;
}

const SEED_MEMBERS: MemberRow[] = [
  {
    id: "seed-1",
    nameKey: "inviteUser1Member1Name",
    emailKey: "inviteUser1Member1Email",
    roleKey: "inviteUser1RoleAdmin",
    statusKey: "inviteUser1StatusActive",
  },
  {
    id: "seed-2",
    nameKey: "inviteUser1Member2Name",
    emailKey: "inviteUser1Member2Email",
    roleKey: "inviteUser1RoleEditor",
    statusKey: "inviteUser1StatusActive",
  },
  {
    id: "seed-3",
    nameKey: "inviteUser1Member3Name",
    emailKey: "inviteUser1Member3Email",
    roleKey: "inviteUser1RoleViewer",
    statusKey: "inviteUser1StatusActive",
  },
];

const ROLE_OPTIONS = [
  { value: "admin", labelKey: "inviteUser1RoleAdmin" },
  { value: "editor", labelKey: "inviteUser1RoleEditor" },
  { value: "viewer", labelKey: "inviteUser1RoleViewer" },
] as const;

export function MemberTableDialogInviteUser() {
  const t = useMessages("pages") as unknown as PagesWithInviteUserMessages;
  const iu = t.inviteUser;

  const [members, setMembers] = useState<MemberRow[]>(SEED_MEMBERS);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  function handleSend() {
    if (!email.trim()) return;
    const roleKey =
      ROLE_OPTIONS.find((option) => option.value === role)?.labelKey ??
      "inviteUser1RoleEditor";
    setMembers((prev) => [
      ...prev,
      {
        id: `pending-${prev.length}-${email}`,
        email,
        roleKey,
        statusKey: "inviteUser1StatusPending",
      },
    ]);
    setEmail("");
    setRole("editor");
    setOpen(false);
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>{iu.inviteUser1Heading}</CardTitle>
                <CardDescription>{iu.inviteUser1Description}</CardDescription>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger variant="primary" size="sm">
                  <IconUserPlus
                    size={15}
                    className="mr-1.5"
                    aria-hidden="true"
                  />
                  {iu.inviteUser1InviteButton}
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>{iu.inviteUser1DialogTitle}</DialogTitle>
                    <DialogDescription>
                      {iu.inviteUser1DialogDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="iu1-email">
                        {iu.inviteUser1EmailLabel}
                      </Label>
                      <Input
                        id="iu1-email"
                        type="email"
                        value={email}
                        placeholder={iu.inviteUser1EmailPlaceholder}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>{iu.inviteUser1RoleLabel}</Label>
                      <Select
                        value={role}
                        onValueChange={setRole}
                        name="iu1-role"
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={iu.inviteUser1RoleSelectPlaceholder}
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
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose variant="ghost">
                      {iu.inviteUser1Cancel}
                    </DialogClose>
                    <Button
                      variant="primary"
                      onClick={handleSend}
                      disabled={!email.trim()}
                    >
                      {iu.inviteUser1SendInvite}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{iu.inviteUser1ColMember}</TableHead>
                  <TableHead>{iu.inviteUser1ColRole}</TableHead>
                  <TableHead>{iu.inviteUser1ColStatus}</TableHead>
                  <TableHead className="text-right">
                    {iu.inviteUser1ColActions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const displayName = member.nameKey
                    ? iu[member.nameKey]
                    : (member.email ?? "");
                  const displayEmail = member.emailKey
                    ? iu[member.emailKey]
                    : iu.inviteUser1PendingSubtext;
                  const isPending =
                    member.statusKey === "inviteUser1StatusPending";
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar fallback={displayName} size="sm" />
                          <div className="flex min-w-0 flex-col">
                            <span className="text-fg truncate text-sm font-medium">
                              {displayName}
                            </span>
                            <span className="text-muted truncate text-xs">
                              {displayEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          {member.roleKey === "inviteUser1RoleAdmin" && (
                            <IconCrown size={12} aria-hidden="true" />
                          )}
                          {iu[member.roleKey]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isPending ? "outline" : "success"}>
                          {iu[member.statusKey]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={iu.inviteUser1RemoveAria}
                          onClick={() => handleRemove(member.id)}
                        >
                          <IconTrash size={14} aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
