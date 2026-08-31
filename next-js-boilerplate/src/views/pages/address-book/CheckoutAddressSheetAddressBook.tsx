"use client";

import { useState } from "react";
import { IconMapPin, IconTruck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/Sheet";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithAddressBookMessages } from "@/types/pages/address-book/AddressBookMessages-types";

interface AddressSeed {
  id: string;
  labelKey: string;
  line1Key: string;
  line2Key: string;
}

const ADDRESS_SEEDS: AddressSeed[] = [
  {
    id: "addr-1",
    labelKey: "addressBook4Address1Label",
    line1Key: "addressBook4Address1Line1",
    line2Key: "addressBook4Address1Line2",
  },
  {
    id: "addr-2",
    labelKey: "addressBook4Address2Label",
    line1Key: "addressBook4Address2Line1",
    line2Key: "addressBook4Address2Line2",
  },
  {
    id: "addr-3",
    labelKey: "addressBook4Address3Label",
    line1Key: "addressBook4Address3Line1",
    line2Key: "addressBook4Address3Line2",
  },
];

interface NewAddressForm {
  name: string;
  line1: string;
  city: string;
  phone: string;
}

const EMPTY_NEW_ADDRESS: NewAddressForm = {
  name: "",
  line1: "",
  city: "",
  phone: "",
};

let extraAddressCounter = 0;

export function CheckoutAddressSheetAddressBook() {
  const t = useMessages("pages") as unknown as PagesWithAddressBookMessages;
  const ab = t.addressBook;

  const [addresses, setAddresses] = useState(() =>
    ADDRESS_SEEDS.map((seed) => ({
      id: seed.id,
      label: ab[seed.labelKey],
      line1: ab[seed.line1Key],
      line2: ab[seed.line2Key],
    })),
  );
  const [selectedId, setSelectedId] = useState(ADDRESS_SEEDS[0]?.id ?? "");
  const [pendingId, setPendingId] = useState(selectedId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] =
    useState<NewAddressForm>(EMPTY_NEW_ADDRESS);

  const selected = addresses.find((address) => address.id === selectedId);

  const handleOpenSheet = () => {
    setPendingId(selectedId);
    setShowAddForm(false);
    setNewAddress(EMPTY_NEW_ADDRESS);
  };

  const handleSaveNewAddress = () => {
    extraAddressCounter += 1;
    const id = `addr-new-${extraAddressCounter}`;
    setAddresses((prev) => [
      ...prev,
      {
        id,
        label: newAddress.name,
        line1: newAddress.line1,
        line2: newAddress.city,
      },
    ]);
    setSelectedId(id);
  };

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {ab.addressBook4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {ab.addressBook4Description}
          </Typography>
        </div>

        <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6">
          <div className="flex items-center gap-2">
            <IconTruck size={18} className="text-muted" aria-hidden="true" />
            <Typography variant="h4">
              {ab.addressBook4OrderSummaryTitle}
            </Typography>
          </div>

          <div className="border-border flex items-center justify-between gap-4 border-b pb-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {ab.addressBook4ItemName}
              </span>
              <span className="text-muted text-xs">
                {ab.addressBook4ItemQty}
              </span>
            </div>
            <span className="text-sm">{ab.addressBook4ItemPrice}</span>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">{ab.addressBook4ShippingLabel}</span>
              <span>{ab.addressBook4ShippingValue}</span>
            </div>
            <div className="border-border flex items-center justify-between border-t pt-3">
              <span className="font-medium">{ab.addressBook4TotalLabel}</span>
              <span className="text-lg font-semibold">
                {ab.addressBook4TotalValue}
              </span>
            </div>
          </div>

          <div className="border-border flex flex-col gap-3 border-t pt-5">
            <span className="text-muted text-xs font-medium tracking-wide uppercase">
              {ab.addressBook4SelectedLabel}
            </span>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <IconMapPin
                  size={16}
                  className="text-muted mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{selected?.label}</span>
                  <span className="text-muted text-xs">{selected?.line1}</span>
                  <span className="text-muted text-xs">{selected?.line2}</span>
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSheet}
                    className="shrink-0"
                  >
                    {ab.addressBook4ChangeButton}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex flex-col gap-6 overflow-y-auto"
                >
                  <SheetHeader className="text-left">
                    <SheetTitle>{ab.addressBook4SheetTitle}</SheetTitle>
                    <SheetDescription>
                      {ab.addressBook4SheetDescription}
                    </SheetDescription>
                  </SheetHeader>

                  <RadioGroup
                    value={pendingId}
                    onValueChange={setPendingId}
                    className="gap-3"
                  >
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        htmlFor={`address-book-4-${address.id}`}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <RadioGroupItem
                          value={address.id}
                          id={`address-book-4-${address.id}`}
                          className="mt-0.5"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {address.label}
                          </span>
                          <span className="text-muted text-xs">
                            {address.line1}
                          </span>
                          <span className="text-muted text-xs">
                            {address.line2}
                          </span>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>

                  {showAddForm ? (
                    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="address-book-4-new-name">
                          {ab.addressBook4FieldName}
                        </Label>
                        <Input
                          id="address-book-4-new-name"
                          value={newAddress.name}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="address-book-4-new-line1">
                          {ab.addressBook4FieldLine1}
                        </Label>
                        <Input
                          id="address-book-4-new-line1"
                          value={newAddress.line1}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              line1: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="address-book-4-new-city">
                          {ab.addressBook4FieldCity}
                        </Label>
                        <Input
                          id="address-book-4-new-city"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="address-book-4-new-phone">
                          {ab.addressBook4FieldPhone}
                        </Label>
                        <Input
                          id="address-book-4-new-phone"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddForm(false)}
                        >
                          {ab.addressBook4CancelNew}
                        </Button>
                        <SheetClose asChild>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={handleSaveNewAddress}
                          >
                            {ab.addressBook4SaveNew}
                          </Button>
                        </SheetClose>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(true)}
                    >
                      {ab.addressBook4AddNewToggle}
                    </Button>
                  )}

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button
                        variant="primary"
                        onClick={() => setSelectedId(pendingId)}
                      >
                        {ab.addressBook4Confirm}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <Button variant="primary" size="lg" className="w-full">
          {ab.addressBook4PlaceOrder}
        </Button>
      </div>
    </section>
  );
}
