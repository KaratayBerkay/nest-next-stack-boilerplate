# UI Components

Custom component library built on Radix primitives and Tailwind CSS v4.
All components live in `src/components/ui/`, use `useComponentVariant` for
style presets, and follow the kebab-folder + PascalCase shim anatomy.

---

## Feedback

### Alert

Contextual feedback messages with variants (default, success, warning, error, info).

### Empty

Empty state placeholder with icon, title, and description.

### Progress

Task completion indicator bar.

### Skeleton

Loading content placeholder with line, message, and chat shapes.

### Spinner

Loading spinner with size variants.

### Toast

Timed notification popup with action buttons and stacking.

### Logo Spinner

Brand loading indicator for full-page transitions.

---

## Overlays

### Alert Dialog

Modal confirmation dialog built on `@radix-ui/react-alert-dialog`.

### Confirm Dialog

Yes/no confirmation modal with customizable buttons.

### Dialog

Modal dialog window built on a custom headless implementation with
`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`,
`DialogDescription`, `DialogBody`, `DialogFooter`.

### Drawer

Slide-in panel from any edge.

### Dropdown

Floating dropdown wrapper for positioning content.

### Dropdown Menu

Contextual action menu built on `@radix-ui/react-dropdown-menu`.

### Hover Card

Preview content on hover, built on `@radix-ui/react-hover-card`.

### Popover

Floating content panel built on a custom headless implementation.

### Sheet

Slide-in side panel built on a custom headless implementation.

### Tooltip

Hover hint text built on a custom headless implementation.

### Context Menu

Right-click context menu built on `@radix-ui/react-context-menu`.

### Emoji Picker

Emoji selection popover using `emoji-mart` with category icons.

---

## Forms

### Button

Clickable action button with variants (default, secondary, outline, ghost,
destructive), sizes (sm, md, lg), and icon support.

### Checkbox

Toggle checkbox built on `@radix-ui/react-checkbox`.

### Combobox

Searchable select input with command palette integration.

### Counter

Numeric stepper with increment/decrement buttons.

### Date Picker

Calendar date selector built on `react-day-picker` v10.

### Field Info Button

Info tooltip for form fields using `Tooltip`.

### File Upload

File drag-and-drop zone with preview.

### Form Error Banner

Dismissable inline error alert for form-level errors.

### Form Field Info

Error text and validating spinner for individual form fields.

### Form Level Error

Error message displayed at the form level using TanStack Form.

### Image Upload

Image upload with preview and crop.

### Input

Text input with validation, left/right icons, error states, and font
customization. Variants via `useComponentVariant`.

### Input Group

Labeled input cluster with addons.

### Input OTP

One-time password input with paste support.

### Kbd

Keyboard shortcut display element.

### Label

Form field label built on `@radix-ui/react-label`.

### Native Select

Native HTML `<select>` with consistent styling.

### Radio Group

Radio button group built on `@radix-ui/react-radio-group`.

### Select

Custom dropdown select built on a custom headless implementation with
keyboard navigation and search.

### Slider

Range slider input built on `@radix-ui/react-slider`.

### Step Indicator

Multi-step wizard progress indicator with click navigation.

### Switch

Toggle switch built on `@radix-ui/react-switch`.

### Textarea

Multi-line text input with error states and auto-resize.

### Time Input

Time picker with hour/minute dropdowns and timezone support.

### Toggle

On/off toggle button built on `@radix-ui/react-toggle`.

### Toggle Group

Group of toggle buttons built on `@radix-ui/react-toggle-group`.

---

## Data Display

### Avatar

User image with fallback built on `@radix-ui/react-avatar`.

### Badge

Status and label badge with variants and sizes.

### Card

Content container with `CardHeader`, `CardContent`, `CardFooter`,
`CardTitle`, `CardDescription`.

### Carousel

Image/content carousel built on Embla Carousel.

### Table

Data table with `Table`, `TableHeader`, `TableBody`, `TableFooter`,
`TableRow`, `TableHead`, `TableCell`, `TableCaption`.

### Typography

Text style primitives for headings, paragraphs, and lists.

---

## Navigation

### Accordion

Collapsible content panels built on `@radix-ui/react-accordion` with
`AccordionItemComplex` for rich slot-based content.

### Breadcrumb

Page hierarchy trail.

### Collapsible

Show/hide content built on `@radix-ui/react-collapsible`.

### Command

Command palette with search, groups, and keyboard navigation.

### Menubar

Application menu bar built on `@radix-ui/react-menubar`.

### Navigation Menu

Site navigation links built on `@radix-ui/react-navigation-menu`.

### Pagination

Page number controls with previous/next.

### Tabs

Tabbed content panels built on a custom headless implementation with
`?tab=` URL sync.

### Scroll Area

Custom scrollbar container built on `@radix-ui/react-scroll-area`.

### Scroll To Bottom Button

Jump-to-bottom action for scrollable containers.

---

## Layout

### Aspect Ratio

Responsive aspect ratio container built on `@radix-ui/react-aspect-ratio`.

### Error Boundary

Error fallback UI with reset action.

### Page Header

Page title with optional description and action buttons.

### Page Info

Info dialog that explains a page section with structured content.

### Resizable

Draggable split panes built on `react-resizable-panels`.

### Separator

Visual content divider built on `@radix-ui/react-separator`.
