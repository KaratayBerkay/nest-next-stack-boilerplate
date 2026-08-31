"use client";

import { useState, type KeyboardEvent } from "react";
import { IconMail, IconSend2, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithInviteUserMessages } from "@/types/pages/invite-user/InviteUserMessages-types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { value: "admin", labelKey: "inviteUser3RoleAdmin" },
  { value: "editor", labelKey: "inviteUser3RoleEditor" },
  { value: "viewer", labelKey: "inviteUser3RoleViewer" },
] as const;

export function TagChipInviteUser() {
  const t = useMessages("pages") as unknown as PagesWithInviteUserMessages;
  const iu = t.inviteUser;

  const [chips, setChips] = useState<string[]>([
    iu.inviteUser3SeedEmail1,
    iu.inviteUser3SeedEmail2,
  ]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function commitDraft() {
    const value = draft.trim().replace(/,$/, "");
    if (!value) return;
    if (!EMAIL_PATTERN.test(value)) {
      setError(iu.inviteUser3InvalidEmail);
      return;
    }
    if (chips.includes(value)) {
      setError(iu.inviteUser3DuplicateEmail);
      return;
    }
    setChips((prev) => [...prev, value]);
    setDraft("");
    setError("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && chips.length > 0) {
      setChips((prev) => prev.slice(0, -1));
    }
  }

  function handleRemove(email: string) {
    setChips((prev) => prev.filter((item) => item !== email));
  }

  function handleSend() {
    if (chips.length === 0) return;
    setSent(true);
  }

  function handleReset() {
    setSent(false);
    setChips([]);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{iu.inviteUser3Heading}</CardTitle>
            <CardDescription>{iu.inviteUser3Description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {sent ? (
              <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-lg border px-6 py-10 text-center">
                <span className="bg-success/10 text-success inline-flex size-11 items-center justify-center rounded-full">
                  <IconSend2 size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-fg text-base font-semibold">
                    {iu.inviteUser3SentHeading}
                  </span>
                  <span className="text-muted text-sm">{iu.inviteUser3SentDescription}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  {iu.inviteUser3SendMoreButton}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="iu3-email">{iu.inviteUser3EmailLabel}</Label>
                  <div className="border-border focus-within:ring-brand flex w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5 shadow-sm focus-within:ring-2">
                    {chips.map((chipEmail) => (
                      <Badge key={chipEmail} variant="secondary" className="gap-1.5 pr-1.5">
                        {chipEmail}
                        <button
                          type="button"
                          aria-label={`${iu.inviteUser3RemoveChipAriaPrefix} ${chipEmail}`}
                          onClick={() => handleRemove(chipEmail)}
                          className="hover:bg-surface-hover ml-0.5 inline-flex size-4 items-center justify-center rounded-full"
                        >
                          <IconX size={11} aria-hidden="true" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      id="iu3-email"
                      type="email"
                      value={draft}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        if (error) setError("");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={chips.length === 0 ? iu.inviteUser3EmailPlaceholder : ""}
                      className="text-fg placeholder:text-muted/70 min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
                    />
                  </div>
                  {error ? (
                    <span className="text-error text-xs">{error}</span>
                  ) : (
                    <span className="text-muted text-xs">{iu.inviteUser3EmailHint}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>{iu.inviteUser3RoleLabel}</Label>
                  <Select value={role} onValueChange={setRole} name="iu3-role">
                    <SelectTrigger>
                      <SelectValue placeholder={iu.inviteUser3RoleSelectPlaceholder} />
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

                <Button
                  variant="primary"
                  disabled={chips.length === 0}
                  onClick={handleSend}
                  leftIcon={<IconMail size={16} aria-hidden="true" />}
                >
                  {iu.inviteUser3SendButton}
                  {chips.length > 0 && (
                    <Badge variant="soft" pill className="ml-2">
                      {chips.length}
                    </Badge>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
