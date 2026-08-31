"use client";

import { useState } from "react";
import {
  IconBrandCashapp,
  IconBrandMastercard,
  IconBrandPaypal,
  IconBrandVisa,
  IconBuildingBank,
  IconCheck,
  IconPencil,
  IconPlus,
  IconTrash,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPaymentMethodsMessages } from "@/types/pages/payment-methods/PaymentMethodsMessages-types";

interface SavedMethod {
  id: string;
  icon: Icon;
  nicknameKey: string;
  subtitleKey: string;
}

const INITIAL_METHODS: SavedMethod[] = [
  {
    id: "visa",
    icon: IconBrandVisa,
    nicknameKey: "paymentMethods1Card1Nickname",
    subtitleKey: "paymentMethods1Card1Subtitle",
  },
  {
    id: "mastercard",
    icon: IconBrandMastercard,
    nicknameKey: "paymentMethods1Card2Nickname",
    subtitleKey: "paymentMethods1Card2Subtitle",
  },
  {
    id: "bank",
    icon: IconBuildingBank,
    nicknameKey: "paymentMethods1Card3Nickname",
    subtitleKey: "paymentMethods1Card3Subtitle",
  },
];

const POOL_METHODS: SavedMethod[] = [
  {
    id: "paypal",
    icon: IconBrandPaypal,
    nicknameKey: "paymentMethods1Card4Nickname",
    subtitleKey: "paymentMethods1Card4Subtitle",
  },
  {
    id: "cashapp",
    icon: IconBrandCashapp,
    nicknameKey: "paymentMethods1Card5Nickname",
    subtitleKey: "paymentMethods1Card5Subtitle",
  },
];

export function InlineEditListPaymentMethods() {
  const t = useMessages("pages") as unknown as PagesWithPaymentMethodsMessages;
  const pm = t.paymentMethods;

  const [methods, setMethods] = useState<SavedMethod[]>(INITIAL_METHODS);
  const [defaultId, setDefaultId] = useState<string>(INITIAL_METHODS[0].id);
  const [nicknameOverrides, setNicknameOverrides] = useState<
    Record<string, string>
  >({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const displayName = (method: SavedMethod) =>
    nicknameOverrides[method.id] ?? pm[method.nicknameKey];

  function startEdit(method: SavedMethod) {
    setEditingId(method.id);
    setDraftName(displayName(method));
  }

  function saveEdit() {
    const trimmed = draftName.trim();
    if (editingId && trimmed) {
      setNicknameOverrides((prev) => ({ ...prev, [editingId]: trimmed }));
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function removeMethod(id: string) {
    const next = methods.filter((method) => method.id !== id);
    setMethods(next);
    if (defaultId === id) {
      setDefaultId(next[0]?.id ?? "");
    }
    if (editingId === id) {
      setEditingId(null);
    }
  }

  const nextPoolMethod = POOL_METHODS.find(
    (method) => !methods.some((existing) => existing.id === method.id),
  );

  function addMethod() {
    if (!nextPoolMethod) return;
    setMethods((prev) => [...prev, nextPoolMethod]);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{pm.paymentMethods1Heading}</CardTitle>
            <CardDescription>{pm.paymentMethods1Description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {methods.length === 0 ? (
              <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
                <IconWallet size={28} className="text-muted" aria-hidden="true" />
                <p className="text-fg font-medium">
                  {pm.paymentMethods1EmptyTitle}
                </p>
                <p className="text-muted text-sm">
                  {pm.paymentMethods1EmptyDescription}
                </p>
              </div>
            ) : (
              <RadioGroup
                value={defaultId}
                onValueChange={setDefaultId}
                className="flex flex-col gap-3"
              >
                {methods.map((method) => {
                  const rid = `pm1-${method.id}`;
                  const isEditing = editingId === method.id;
                  const name = displayName(method);

                  return (
                    <div
                      key={method.id}
                      className="border-border has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <RadioGroupItem
                        value={method.id}
                        id={rid}
                        disabled={isEditing}
                      />
                      {isEditing ? (
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <method.icon
                            size={20}
                            className="text-muted shrink-0"
                            aria-hidden="true"
                          />
                          <Input
                            value={draftName}
                            onChange={(event) =>
                              setDraftName(event.target.value)
                            }
                            aria-label={pm.paymentMethods1EditNicknameAria}
                            className="h-8"
                          />
                        </div>
                      ) : (
                        <label
                          htmlFor={rid}
                          aria-label={name}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                        >
                          <method.icon
                            size={20}
                            className="text-muted shrink-0"
                            aria-hidden="true"
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="text-fg truncate text-sm font-medium">
                              {name}
                            </span>
                            <span className="text-muted truncate text-xs">
                              {pm[method.subtitleKey]}
                            </span>
                          </div>
                        </label>
                      )}
                      <div className="flex shrink-0 items-center gap-1">
                        {!isEditing && method.id === defaultId && (
                          <Badge variant="soft" size="sm">
                            {pm.paymentMethods1DefaultBadge}
                          </Badge>
                        )}
                        {isEditing ? (
                          <>
                            <IconButton
                              icon={<IconCheck size={14} aria-hidden="true" />}
                              label={pm.paymentMethods1SaveAria}
                              variant="ghost"
                              size="icon-sm"
                              onClick={saveEdit}
                            />
                            <IconButton
                              icon={<IconX size={14} aria-hidden="true" />}
                              label={pm.paymentMethods1CancelAria}
                              variant="ghost"
                              size="icon-sm"
                              onClick={cancelEdit}
                            />
                          </>
                        ) : (
                          <IconButton
                            icon={<IconPencil size={14} aria-hidden="true" />}
                            label={pm.paymentMethods1EditAria.replace(
                              "{name}",
                              name,
                            )}
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => startEdit(method)}
                          />
                        )}
                        <IconButton
                          icon={<IconTrash size={14} aria-hidden="true" />}
                          label={pm.paymentMethods1RemoveAria.replace(
                            "{name}",
                            name,
                          )}
                          variant="ghost"
                          size="icon-sm"
                          className="text-error hover:text-error"
                          onClick={() => removeMethod(method.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
          </CardContent>
          {nextPoolMethod && (
            <CardFooter>
              <Button variant="outline" onClick={addMethod}>
                <IconPlus size={16} aria-hidden="true" />
                {pm.paymentMethods1AddLabel}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </section>
  );
}
