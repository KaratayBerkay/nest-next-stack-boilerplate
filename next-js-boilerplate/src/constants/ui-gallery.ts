// Registry of every ui demo page. Consumed by the /v1/:lang/ui gallery and
// by e2e/ui-smoke.spec.ts + e2e/ui-a11y.spec.ts.
export const UI_COMPONENTS = [
  // Feedback
  {
    name: "Alert",
    slug: "alert",
    category: "Feedback",
    description: "Contextual feedback messages",
  },
  {
    name: "Empty",
    slug: "empty",
    category: "Feedback",
    description: "Empty state placeholder",
  },
  {
    name: "Progress",
    slug: "progress",
    category: "Feedback",
    description: "Task completion indicator",
  },
  {
    name: "Skeleton",
    slug: "skeleton",
    category: "Feedback",
    description: "Loading content placeholder",
  },
  {
    name: "Spinner",
    slug: "spinner",
    category: "Feedback",
    description: "Loading spinner",
  },
  {
    name: "Toast",
    slug: "toast",
    category: "Feedback",
    description: "Timed notification popup",
  },
  {
    name: "Logo Spinner",
    slug: "logo-spinner",
    category: "Feedback",
    description: "Brand loading indicator",
  },

  // Overlays
  {
    name: "Alert Dialog",
    slug: "alert-dialog",
    category: "Overlays",
    description: "Modal confirmation dialog",
  },
  {
    name: "Confirm Dialog",
    slug: "confirm-dialog",
    category: "Overlays",
    description: "Yes/no confirmation modal",
  },
  {
    name: "Dialog",
    slug: "dialog",
    category: "Overlays",
    description: "Modal dialog window",
  },
  {
    name: "Drawer",
    slug: "drawer",
    category: "Overlays",
    description: "Slide-in panel",
  },
  {
    name: "Dropdown",
    slug: "dropdown",
    category: "Overlays",
    description: "Floating dropdown wrapper",
  },
  {
    name: "Dropdown Menu",
    slug: "dropdown-menu",
    category: "Overlays",
    description: "Contextual action menu",
  },
  {
    name: "Hover Card",
    slug: "hover-card",
    category: "Overlays",
    description: "Preview on hover",
  },
  {
    name: "Popover",
    slug: "popover",
    category: "Overlays",
    description: "Floating content panel",
  },
  {
    name: "Sheet",
    slug: "sheet",
    category: "Overlays",
    description: "Slide-in side panel",
  },
  {
    name: "Tooltip",
    slug: "tooltip",
    category: "Overlays",
    description: "Hover hint text",
  },
  {
    name: "Context Menu",
    slug: "context-menu",
    category: "Overlays",
    description: "Right-click menu",
  },
  {
    name: "Emoji Picker",
    slug: "emoji-picker",
    category: "Overlays",
    description: "Emoji selection popover",
  },

  // Forms
  {
    name: "Button",
    slug: "button",
    category: "Forms",
    description: "Clickable action button",
  },
  {
    name: "Checkbox",
    slug: "checkbox",
    category: "Forms",
    description: "Toggle checkbox",
  },
  {
    name: "Combobox",
    slug: "combobox",
    category: "Forms",
    description: "Searchable select input",
  },
  {
    name: "Counter",
    slug: "counter",
    category: "Forms",
    description: "Numeric stepper",
  },
  {
    name: "Date Picker",
    slug: "date-picker",
    category: "Forms",
    description: "Calendar date selector",
  },
  {
    name: "Field Info Button",
    slug: "field-info-button",
    category: "Forms",
    description: "Info tooltip for fields",
  },
  {
    name: "File Upload",
    slug: "file-upload",
    category: "Forms",
    description: "File drag-and-drop zone",
  },
  {
    name: "Form Error Banner",
    slug: "form-error-banner",
    category: "Forms",
    description: "Form-level error alert",
  },
  {
    name: "Form Field Info",
    slug: "form-field-info",
    category: "Forms",
    description: "Field error and spinner",
  },
  {
    name: "Form Level Error",
    slug: "form-level-error",
    category: "Forms",
    description: "TanStack Form error banner",
  },
  {
    name: "Image Upload",
    slug: "image-upload",
    category: "Forms",
    description: "Image upload with preview",
  },
  {
    name: "Input",
    slug: "input",
    category: "Forms",
    description: "Text input with validation",
  },
  {
    name: "Input Group",
    slug: "input-group",
    category: "Forms",
    description: "Labeled input cluster",
  },
  {
    name: "Input OTP",
    slug: "input-otp",
    category: "Forms",
    description: "One-time password input",
  },
  {
    name: "Kbd",
    slug: "kbd",
    category: "Forms",
    description: "Keyboard shortcut display",
  },
  {
    name: "Label",
    slug: "label",
    category: "Forms",
    description: "Form field label",
  },
  {
    name: "Native Select",
    slug: "native-select",
    category: "Forms",
    description: "Native dropdown select",
  },
  {
    name: "Radio Group",
    slug: "radio-group",
    category: "Forms",
    description: "Radio button group",
  },
  {
    name: "Select",
    slug: "select",
    category: "Forms",
    description: "Custom dropdown select",
  },
  {
    name: "Slider",
    slug: "slider",
    category: "Forms",
    description: "Range slider input",
  },
  {
    name: "Step Indicator",
    slug: "step-indicator",
    category: "Forms",
    description: "Multi-step wizard progress",
  },
  {
    name: "Switch",
    slug: "switch",
    category: "Forms",
    description: "Toggle switch",
  },
  {
    name: "Textarea",
    slug: "textarea",
    category: "Forms",
    description: "Multi-line text input",
  },
  {
    name: "Time Input",
    slug: "time-input",
    category: "Forms",
    description: "Time picker with dropdowns",
  },
  {
    name: "Toggle",
    slug: "toggle",
    category: "Forms",
    description: "On/off toggle button",
  },
  {
    name: "Toggle Group",
    slug: "toggle-group",
    category: "Forms",
    description: "Group of toggle buttons",
  },

  // Data Display
  {
    name: "Avatar",
    slug: "avatar",
    category: "Data",
    description: "User image placeholder",
  },
  {
    name: "Badge",
    slug: "badge",
    category: "Data",
    description: "Status and label badge",
  },
  {
    name: "Card",
    slug: "card",
    category: "Data",
    description: "Content container",
  },
  {
    name: "Carousel",
    slug: "carousel",
    category: "Data",
    description: "Image/content carousel",
  },
  {
    name: "Table",
    slug: "table",
    category: "Data",
    description: "Data table with headers",
  },
  {
    name: "Typography",
    slug: "typography",
    category: "Data",
    description: "Text style primitives",
  },

  // Navigation
  {
    name: "Accordion",
    slug: "accordion",
    category: "Navigation",
    description: "Collapsible content panels",
  },
  {
    name: "Breadcrumb",
    slug: "breadcrumb",
    category: "Navigation",
    description: "Page hierarchy trail",
  },
  {
    name: "Collapsible",
    slug: "collapsible",
    category: "Navigation",
    description: "Show/hide content",
  },
  {
    name: "Command",
    slug: "command",
    category: "Navigation",
    description: "Command palette",
  },
  {
    name: "Menubar",
    slug: "menubar",
    category: "Navigation",
    description: "Application menu bar",
  },
  {
    name: "Navigation Menu",
    slug: "navigation-menu",
    category: "Navigation",
    description: "Site navigation links",
  },
  {
    name: "Pagination",
    slug: "pagination",
    category: "Navigation",
    description: "Page number controls",
  },
  {
    name: "Tabs",
    slug: "tabs",
    category: "Navigation",
    description: "Tabbed content panels",
  },
  {
    name: "Scroll Area",
    slug: "scroll-area",
    category: "Navigation",
    description: "Custom scrollbar container",
  },
  {
    name: "Scroll To Bottom Button",
    slug: "scroll-to-bottom-button",
    category: "Navigation",
    description: "Jump to bottom action",
  },

  // Layout
  {
    name: "Aspect Ratio",
    slug: "aspect-ratio",
    category: "Layout",
    description: "Responsive aspect ratio",
  },
  {
    name: "Error Boundary",
    slug: "error-boundary",
    category: "Layout",
    description: "Error fallback UI",
  },
  {
    name: "Page Header",
    slug: "page-header",
    category: "Layout",
    description: "Page title with actions",
  },
  {
    name: "Page Info",
    slug: "page-info",
    category: "Layout",
    description: "Info dialog for sections",
  },
  {
    name: "Resizable",
    slug: "resizable",
    category: "Layout",
    description: "Draggable split panes",
  },
  {
    name: "Separator",
    slug: "separator",
    category: "Layout",
    description: "Visual content divider",
  },
] as const;

export type UIComponentSlug = (typeof UI_COMPONENTS)[number]["slug"];
export type UIComponentCategory = (typeof UI_COMPONENTS)[number]["category"];
