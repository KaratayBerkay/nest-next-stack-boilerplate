"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Button,
  IconButton,
  ButtonGroup,
  ButtonGroupItem,
} from "@/components/ui/Button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/Tooltip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast/use-toast";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { Variant, Size } from "@/components/ui/button-styles";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function handleSave(setSaving: Dispatch<SetStateAction<boolean>>) {
  setSaving(true);
  setTimeout(() => setSaving(false), 1500);
}

const FORM_VARIANTS: { variant: Variant; label: string }[] = [
  { variant: "default", label: "Default" },
  { variant: "primary", label: "Primary" },
  { variant: "secondary", label: "Secondary" },
  { variant: "outline", label: "Outline" },
  { variant: "ghost", label: "Ghost" },
  { variant: "destructive", label: "Destructive" },
  { variant: "link", label: "Link" },
  { variant: "soft", label: "Soft" },
  { variant: "shadow", label: "Shadow" },
];

const FORM_SIZES: { size: Size; label: string }[] = [
  { size: "xs", label: "XS" },
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
];

function FormActionsTab() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          {FORM_VARIANTS.map(({ variant, label }) => (
            <Tooltip key={variant}>
              <TooltipTrigger>
                <Button variant={variant}>{label}</Button>
              </TooltipTrigger>
              <TooltipContent>variant=&quot;{variant}&quot;</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          {FORM_SIZES.map(({ size, label }) => (
            <Tooltip key={size}>
              <TooltipTrigger>
                <Button size={size}>{label}</Button>
              </TooltipTrigger>
              <TooltipContent>size=&quot;{size}&quot;</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Loading & Disabled</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="primary"
                onClick={() => handleSave(setSaving)}
                loading={saving}
              >
                Save Changes
              </Button>
            </TooltipTrigger>
            <TooltipContent>Simulates a 1.5s save</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">Cancel</Button>
            </TooltipTrigger>
            <TooltipContent>Dismiss without saving</TooltipContent>
          </Tooltip>
          <Button disabled>Disabled</Button>
        </div>
      </section>
    </div>
  );
}

function DestructiveFlowTab() {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Destructive Flow</h3>
        <p className="text-muted text-sm">
          Click the button below to trigger a destructive action with
          confirmation.
        </p>
        <div>
          <ConfirmDialog
            title="Delete Account"
            description="This action cannot be undone. All your data will be permanently removed."
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => {
              setDeleting(true);
              setTimeout(() => {
                setDeleting(false);
                toast({
                  title: "Account deleted",
                  description:
                    "Your account has been deleted. This action can be undone for 30 seconds.",
                  variant: "destructive",
                  duration: 10000,
                });
              }, 1500);
            }}
          >
            {(open: () => void) => (
              <Button variant="destructive" onClick={open} loading={deleting}>
                Delete Account
              </Button>
            )}
          </ConfirmDialog>
        </div>
      </section>
    </div>
  );
}

function SignInButtonsTab() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  return (
    <div className="max-w-sm space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setLoadingGoogle(true);
          setTimeout(() => setLoadingGoogle(false), 1500);
        }}
        loading={loadingGoogle}
        leftIcon={
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        }
      >
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setLoadingGithub(true);
          setTimeout(() => setLoadingGithub(false), 1500);
        }}
        loading={loadingGithub}
        leftIcon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        }
      >
        Continue with GitHub
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg text-muted px-2 text-xs">or</span>
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={() => {
          setLoadingEmail(true);
          setTimeout(() => setLoadingEmail(false), 1500);
        }}
        loading={loadingEmail}
        leftIcon={
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        }
      >
        Continue with Email
      </Button>
    </div>
  );
}

function IconButtonsTab() {
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Size Scale</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <IconButton
                icon={
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                }
                label="Close"
                variant="outline"
                size="icon-xs"
              />
            </TooltipTrigger>
            <TooltipContent>Close (icon-xs)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <IconButton
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                }
                label="Close"
                variant="outline"
                size="icon-sm"
              />
            </TooltipTrigger>
            <TooltipContent>Close (icon-sm)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <IconButton
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                }
                label="Close"
                variant="outline"
                size="icon"
              />
            </TooltipTrigger>
            <TooltipContent>Close (icon)</TooltipContent>
          </Tooltip>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Real Actions</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <IconButton
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                }
                label="Copy"
                variant="outline"
                size="icon"
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <IconButton
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={spinning ? "animate-spin" : ""}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                }
                label="Refresh"
                variant="outline"
                size="icon"
                onClick={() => {
                  setSpinning(true);
                  setTimeout(() => setSpinning(false), 1000);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <IconButton
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                }
                label="Delete"
                variant="destructive"
                size="icon"
                onClick={() => {
                  setConfirmDelete(true);
                  setTimeout(() => setConfirmDelete(false), 1500);
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              {confirmDelete ? "Deleted" : "Delete"}
            </TooltipContent>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}

function ButtonGroupsTab() {
  const [viewMode, setViewMode] = useState("list");
  const [align, setAlign] = useState("left");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Horizontal</h3>
        <ButtonGroup>
          <ButtonGroupItem
            active={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </ButtonGroupItem>
          <ButtonGroupItem
            active={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Grid
          </ButtonGroupItem>
          <ButtonGroupItem
            active={viewMode === "card"}
            onClick={() => setViewMode("card")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="2" y1="9" x2="22" y2="9" />
            </svg>
            Card
          </ButtonGroupItem>
        </ButtonGroup>
        <p className="text-muted text-xs">View: {viewMode}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Vertical</h3>
        <ButtonGroup orientation="vertical">
          <ButtonGroupItem
            active={align === "left"}
            onClick={() => setAlign("left")}
            orientation="vertical"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 10H3" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M17 18H3" />
            </svg>
            Left Align
          </ButtonGroupItem>
          <ButtonGroupItem
            active={align === "center"}
            onClick={() => setAlign("center")}
            orientation="vertical"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 10H7" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M17 18H7" />
            </svg>
            Center Align
          </ButtonGroupItem>
          <ButtonGroupItem
            active={align === "right"}
            onClick={() => setAlign("right")}
            orientation="vertical"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10H7" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M21 18H7" />
            </svg>
            Right Align
          </ButtonGroupItem>
        </ButtonGroup>
        <p className="text-muted text-xs">Align: {align}</p>
      </section>
    </div>
  );
}

export default function ButtonPage({ initialTab }: { initialTab?: string }) {
  const examples: UIExample[] = [
    {
      id: "usage",
      title: "Form Actions",
      description:
        "All button variants, sizes, loading states, and destructive flow.",
      render: () => <FormActionsTab />,
    },
    {
      id: "sign-in",
      title: "Sign-in Buttons",
      description:
        "Social sign-in with Google, GitHub, and email with loading states.",
      render: () => <SignInButtonsTab />,
    },
    {
      id: "destructive-flow",
      title: "Destructive Flow",
      description:
        "Destructive action with confirmation dialog and undoable toast.",
      render: () => <DestructiveFlowTab />,
    },
    {
      id: "icon-buttons",
      title: "Icon Buttons",
      description: "Icon button sizes with tooltips and real action examples.",
      render: () => <IconButtonsTab />,
    },
    {
      id: "button-groups",
      title: "Button Groups",
      description: "Horizontal and vertical button group variants.",
      render: () => <ButtonGroupsTab />,
    },
    {
      id: "variant-gallery",
      title: "Variant Gallery",
      description: "All variants and sizes.",
      render: () => (
        <VariantGallery
          variants={[
            "default",
            "primary",
            "secondary",
            "outline",
            "ghost",
            "destructive",
            "link",
            "soft",
            "shadow",
          ]}
          sizes={["xs", "sm", "md", "lg", "icon", "icon-sm", "icon-xs"]}
          render={(variant, size) =>
            size.startsWith("icon") ? (
              <Button
                variant={variant as Variant}
                size={size as Size}
                aria-label="Add"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </Button>
            ) : (
              <Button variant={variant as Variant} size={size as Size}>
                Button
              </Button>
            )
          }
        />
      ),
    },
  ];

  return (
    <ExampleTabs
      title="Button"
      intro="Displays a button or a component that looks like a button."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
