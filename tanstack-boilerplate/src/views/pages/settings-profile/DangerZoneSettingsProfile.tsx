"use client";

import { useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Alert, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsProfileMessages } from "@/types/pages/settings-profile/SettingsProfileMessages-types";

export function DangerZoneSettingsProfile() {
  const t = useMessages("pages") as unknown as PagesWithSettingsProfileMessages;
  const sp = t.settingsProfile;

  const [deactivated, setDeactivated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const requiredPhrase = sp.settingsProfile7DeleteUsername;
  const canDelete = confirmInput.trim() === requiredPhrase;

  function handleDelete() {
    if (!canDelete) return;
    setDeleted(true);
    setDeleteOpen(false);
    setConfirmInput("");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="border-error/30 bg-error/5 rounded-xl border p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <IconAlertTriangle size={20} className="text-error" aria-hidden="true" />
            <h2 className="text-fg text-lg font-semibold tracking-tight">
              {sp.settingsProfile7Heading}
            </h2>
          </div>

          <Alert variant="warning" className="mb-6">
            <AlertTitle>{sp.settingsProfile7Subheading}</AlertTitle>
          </Alert>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-fg text-sm font-medium">
                {sp.settingsProfile7DeactivateTitle}
              </span>
              <span className="text-muted text-sm">
                {sp.settingsProfile7DeactivateDescription}
              </span>
            </div>
            {deactivated ? (
              <Badge variant="warning" className="shrink-0">
                {sp.settingsProfile7DeactivatedBadge}
              </Badge>
            ) : (
              <ConfirmDialog
                title={sp.settingsProfile7DeactivateConfirmTitle}
                description={sp.settingsProfile7DeactivateConfirmDescription}
                confirmLabel={sp.settingsProfile7DeactivateConfirmConfirm}
                cancelLabel={sp.settingsProfile7DeactivateConfirmCancel}
                onConfirm={() => setDeactivated(true)}
              >
                {(open) => (
                  <Button variant="outline" className="shrink-0" onClick={open}>
                    {sp.settingsProfile7DeactivateButton}
                  </Button>
                )}
              </ConfirmDialog>
            )}
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-fg text-sm font-medium">{sp.settingsProfile7DeleteTitle}</span>
              <span className="text-muted text-sm">{sp.settingsProfile7DeleteDescription}</span>
            </div>
            {deleted ? (
              <Badge variant="error" className="shrink-0">
                {sp.settingsProfile7DeletedBadge}
              </Badge>
            ) : (
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger variant="destructive" className="shrink-0">
                  {sp.settingsProfile7DeleteButton}
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>{sp.settingsProfile7DeleteDialogTitle}</DialogTitle>
                    <DialogDescription>
                      {sp.settingsProfile7DeleteDialogDescription}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dz-confirm-phrase">
                        {sp.settingsProfile7DeleteConfirmLabel.replace(
                          "{phrase}",
                          requiredPhrase,
                        )}
                      </Label>
                      <Input
                        id="dz-confirm-phrase"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder={requiredPhrase}
                      />
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose>{sp.settingsProfile7DeleteCancelButton}</DialogClose>
                    <Button variant="destructive" disabled={!canDelete} onClick={handleDelete}>
                      {sp.settingsProfile7DeleteConfirmButton}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
