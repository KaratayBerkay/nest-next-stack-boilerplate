export type GalleryMode = "real" | "simulated" | "mixed" | "none";

export interface FormsExample {
  name: string;
  slug: string;
  mode: GalleryMode;
  titleKey: string;
  descKey: string;
}

export const FORMS_EXAMPLES = [
  {
    name: "User Profile",
    slug: "profile",
    mode: "real",
    titleKey: "profileTitle",
    descKey: "profileDescription",
  },
  {
    name: "Team Invite",
    slug: "team-invite",
    mode: "simulated",
    titleKey: "teamInviteTitle",
    descKey: "teamInviteDescription",
  },
  {
    name: "API Key Manager",
    slug: "api-key",
    mode: "real",
    titleKey: "apiKeyTitle",
    descKey: "apiKeyDescription",
  },
  {
    name: "Billing",
    slug: "billing",
    mode: "mixed",
    titleKey: "billingTitle",
    descKey: "billingDescription",
  },
  {
    name: "Filters",
    slug: "filters",
    mode: "none",
    titleKey: "filtersTitle",
    descKey: "filtersDescription",
  },
  {
    name: "Field States & Validation Modes",
    slug: "field-states",
    mode: "none",
    titleKey: "fieldStatesTitle",
    descKey: "fieldStatesDescription",
  },
  {
    name: "File Uploads",
    slug: "uploads",
    mode: "mixed",
    titleKey: "uploadsTitle",
    descKey: "uploadsDescription",
  },
  {
    name: "Error & Async States Lab",
    slug: "error-lab",
    mode: "simulated",
    titleKey: "errorLabTitle",
    descKey: "errorLabDescription",
  },
  {
    name: "Checkout & Addresses",
    slug: "checkout",
    mode: "simulated",
    titleKey: "checkoutTitle",
    descKey: "checkoutDescription",
  },
  {
    name: "Content Editor",
    slug: "content-editor",
    mode: "simulated",
    titleKey: "contentEditorTitle",
    descKey: "contentEditorDescription",
  },
  {
    name: "Admin Form Builder",
    slug: "form-builder",
    mode: "simulated",
    titleKey: "formBuilderTitle",
    descKey: "formBuilderDescription",
  },
  {
    name: "Inline Editable Table",
    slug: "editable-table",
    mode: "simulated",
    titleKey: "editableTableTitle",
    descKey: "editableTableDescription",
  },
] as const satisfies readonly FormsExample[];

export type FormsExampleSlug = (typeof FORMS_EXAMPLES)[number]["slug"];
