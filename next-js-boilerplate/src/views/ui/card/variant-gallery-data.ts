export const variants = ["default", "elevated", "interactive", "outline", "surface"] as const;

export const sizes = ["sm", "md", "lg"] as const;

export const variantDescriptions: Record<(typeof variants)[number], string> = {
  default: "Standard card with border and subtle shadow.",
  elevated: "Prominent shadow for emphasis and hierarchy.",
  interactive: "Hover to lift — perfect for clickable content.",
  outline: "Border-only for lightweight visual grouping.",
  surface: "Background-tinted for nested content areas.",
};

export const variantUseCases: Record<(typeof variants)[number], string> = {
  default: "display neutral content",
  elevated: "draw attention to important info",
  interactive: "make content clickable and engaging",
  outline: "group content without adding weight",
  surface: "nest content within sections",
};
