"use client";

import { useState } from "react";
import {
  IconBriefcase,
  IconHome,
  IconHome2,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithAddressBookMessages } from "@/types/pages/address-book/AddressBookMessages-types";

interface ContactSeed {
  id: string;
  icon: Icon;
  typeKey: string;
  nameKey: string;
  line1Key: string;
  cityKey: string;
  phoneKey: string;
}

interface ContactEntry {
  id: string;
  icon: Icon;
  type: string;
  name: string;
  line1: string;
  city: string;
  phone: string;
}

interface AddressForm {
  name: string;
  line1: string;
  city: string;
  phone: string;
}

const CONTACT_SEEDS: ContactSeed[] = [
  {
    id: "contact-1",
    icon: IconHome,
    typeKey: "addressBook1Contact1Type",
    nameKey: "addressBook1Contact1Name",
    line1Key: "addressBook1Contact1Line1",
    cityKey: "addressBook1Contact1City",
    phoneKey: "addressBook1Contact1Phone",
  },
  {
    id: "contact-2",
    icon: IconBriefcase,
    typeKey: "addressBook1Contact2Type",
    nameKey: "addressBook1Contact2Name",
    line1Key: "addressBook1Contact2Line1",
    cityKey: "addressBook1Contact2City",
    phoneKey: "addressBook1Contact2Phone",
  },
  {
    id: "contact-3",
    icon: IconMapPin,
    typeKey: "addressBook1Contact3Type",
    nameKey: "addressBook1Contact3Name",
    line1Key: "addressBook1Contact3Line1",
    cityKey: "addressBook1Contact3City",
    phoneKey: "addressBook1Contact3Phone",
  },
  {
    id: "contact-4",
    icon: IconHome2,
    typeKey: "addressBook1Contact4Type",
    nameKey: "addressBook1Contact4Name",
    line1Key: "addressBook1Contact4Line1",
    cityKey: "addressBook1Contact4City",
    phoneKey: "addressBook1Contact4Phone",
  },
];

const EMPTY_FORM: AddressForm = { name: "", line1: "", city: "", phone: "" };

let newContactCounter = 0;

export function ContactPhotoListAddressBook() {
  const t = useMessages("pages") as unknown as PagesWithAddressBookMessages;
  const ab = t.addressBook;

  const [entries, setEntries] = useState<ContactEntry[]>(() =>
    CONTACT_SEEDS.map((seed) => ({
      id: seed.id,
      icon: seed.icon,
      type: ab[seed.typeKey],
      name: ab[seed.nameKey],
      line1: ab[seed.line1Key],
      city: ab[seed.cityKey],
      phone: ab[seed.phoneKey],
    })),
  );
  const [defaultId, setDefaultId] = useState<string | null>(
    CONTACT_SEEDS[0]?.id ?? null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

  const openEdit = (entry: ContactEntry) => {
    setEditingId(entry.id);
    setForm({
      name: entry.name,
      line1: entry.line1,
      city: entry.city,
      phone: entry.phone,
    });
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId ? { ...entry, ...form } : entry,
        ),
      );
    } else {
      newContactCounter += 1;
      const id = `contact-new-${newContactCounter}`;
      setEntries((prev) => [
        ...prev,
        { id, icon: IconMapPin, type: ab.addressBook1NewEntryType, ...form },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((entry) => entry.id !== id);
    setEntries(next);
    if (id === defaultId) {
      setDefaultId(next[0]?.id ?? null);
    }
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Typography
              variant="h2"
              className="text-3xl font-medium tracking-tighter md:text-4xl"
            >
              {ab.addressBook1Heading}
            </Typography>
            <Typography variant="bodyLarge" className="text-muted">
              {ab.addressBook1Description}
            </Typography>
          </div>
          <Button
            variant="primary"
            leftIcon={<IconPlus size={16} aria-hidden="true" />}
            onClick={openAdd}
          >
            {ab.addressBook1AddButton}
          </Button>
        </div>

        {entries.length === 0 ? (
          <div className="border-border rounded-xl border border-dashed p-10 text-center">
            <Typography variant="body" className="text-muted">
              {ab.addressBook1EmptyState}
            </Typography>
          </div>
        ) : (
          <ul className="border-border divide-border bg-surface flex flex-col divide-y rounded-2xl border">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <Avatar
                  src={placeholderImage(entry.id, "1x1")}
                  alt=""
                  fallback={entry.name.slice(0, 2)}
                  size="lg"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-fg text-sm font-semibold">
                      {entry.name}
                    </span>
                    <Badge variant="outline" size="sm">
                      <entry.icon size={12} className="mr-1" aria-hidden="true" />
                      {entry.type}
                    </Badge>
                    {entry.id === defaultId && (
                      <Badge variant="soft" size="sm">
                        {ab.addressBook1DefaultBadge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted text-sm">
                    {entry.line1}, {entry.city}
                  </span>
                  <span className="text-muted text-sm">{entry.phone}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:self-start">
                  {entry.id !== defaultId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultId(entry.id)}
                    >
                      {ab.addressBook1SetDefault}
                    </Button>
                  )}
                  <IconButton
                    icon={<IconPencil size={16} aria-hidden="true" />}
                    label={ab.addressBook1EditAria.replace("{name}", entry.name)}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(entry)}
                  />
                  <IconButton
                    icon={<IconTrash size={16} aria-hidden="true" />}
                    label={ab.addressBook1DeleteAria.replace("{name}", entry.name)}
                    variant="ghost"
                    size="icon-sm"
                    className="text-error hover:text-error"
                    onClick={() => handleDelete(entry.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? ab.addressBook1DialogEditTitle
                : ab.addressBook1DialogAddTitle}
            </DialogTitle>
            <DialogDescription>
              {ab.addressBook1DialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address-book-1-name">
                {ab.addressBook1FieldName}
              </Label>
              <Input
                id="address-book-1-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address-book-1-line1">
                {ab.addressBook1FieldLine1}
              </Label>
              <Input
                id="address-book-1-line1"
                value={form.line1}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, line1: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address-book-1-city">
                {ab.addressBook1FieldCity}
              </Label>
              <Input
                id="address-book-1-city"
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address-book-1-phone">
                {ab.addressBook1FieldPhone}
              </Label>
              <Input
                id="address-book-1-phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose>{ab.addressBook1Cancel}</DialogClose>
            <Button variant="primary" onClick={handleSave}>
              {ab.addressBook1Save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
