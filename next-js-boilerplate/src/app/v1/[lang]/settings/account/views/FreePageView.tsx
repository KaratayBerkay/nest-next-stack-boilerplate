"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetchJson } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";

export function FreePageView() {
  const { user, loading, refreshUser } = useAuth();
  const t = useMessages("settings");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const profileLoadedRef = useRef(false);

  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || profileLoadedRef.current) return;
    profileLoadedRef.current = true;
    (async () => {
      try {
        const data = await apiFetchJson<{ user: { name?: string; username?: string; bio?: string; avatarUrl?: string } }>("/api/profile");
        const p = data.user;
        setName(p.name ?? "");
        setUsername(p.username ?? "");
        setBio(p.bio ?? "");
        setAvatarUrl(p.avatarUrl ?? "");
      } catch {
        /* silent */
      }
    })();
  }, [user]);

  /* debounced username check — idle for unchanged / too-short, checking otherwise */
  const checkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevUsername = useRef(username);

  useEffect(() => {
    if (prevUsername.current === username) return;
    prevUsername.current = username;
    if (!username || username === (user?.username ?? "") || username.length < 3) return;
    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(() => {
      setAvailability("checking");
      apiFetchJson<{ available: boolean }>(`/api/profile/username-available?u=${encodeURIComponent(username)}`)
        .then((res) => setAvailability(res.available ? "available" : "taken"))
        .catch(() => setAvailability("taken"));
    }, 300);
    return () => { if (checkTimer.current) clearTimeout(checkTimer.current); };
  }, [username, user?.username]);

  const handleAvatarFile = useCallback(async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    try {
      const uploadRes = await apiFetchJson<{ urls: { full: string } }>("/api/upload", {
        method: "POST",
        body: form,
      });
      setAvatarUrl(uploadRes.urls.full);
    } catch (err) {
      const exception = (err as Error & { exception?: { msg?: string } }).exception;
      toast({ title: exception?.msg ?? t.uploadFailed, variant: "destructive" });
    }
  }, [toast, t.uploadFailed]);

  const saveProfile = useCallback(async () => {
    setSaving(true);
    try {
      await apiFetchJson("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: username || undefined,
          bio,
          avatarUrl: avatarUrl || undefined,
        }),
      });
      toast({ title: t.saveSuccess, variant: "success" });
      await refreshUser();
    } catch (err) {
      const exception = (err as Error & { exception?: { msg?: string } }).exception;
      toast({ title: exception?.msg ?? t.saveFailed, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [name, username, bio, avatarUrl, toast, t.saveSuccess, t.saveFailed, refreshUser]);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message="Sign in to manage your account" />;

  const canSave = !saving && availability !== "checking" && availability !== "taken";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h2 className="text-lg font-semibold">{t.accountHeading}</h2>

      <div className="flex items-center gap-4">
        <Avatar
          src={avatarUrl}
          fallback={initials(name || user.email)}
          size="xl"
          className="bg-brand text-white"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-brand hover:underline"
          >
            {t.avatarChange}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarFile(file);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t.name}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t.username}</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
          />
          {availability === "checking" && (
            <span className="text-xs text-muted">{t.usernameChecking}</span>
          )}
          {availability === "available" && (
            <span className="text-xs text-green-600">{t.usernameAvailable}</span>
          )}
          {availability === "taken" && (
            <span className="text-xs text-red-600">{t.usernameTaken}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t.bio}</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="border-border bg-bg rounded-lg border px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>

      <button
        onClick={saveProfile}
        disabled={!canSave}
        className="bg-brand self-start rounded-lg px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? t.saving : t.save}
      </button>
    </div>
  );
}
