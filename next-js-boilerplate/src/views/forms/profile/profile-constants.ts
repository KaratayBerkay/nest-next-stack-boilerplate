import { formOptions } from "@tanstack/react-form";
import { profileDefaultValues } from "@/validators/forms/profile-inits";

export const profileFormOpts = formOptions({
  defaultValues: profileDefaultValues,
});

export const COUNTRY_OPTIONS = [
  { value: "us", label: "United States", group: "North America" },
  { value: "ca", label: "Canada", group: "North America" },
  { value: "gb", label: "United Kingdom", group: "Europe" },
  { value: "de", label: "Germany", group: "Europe" },
  { value: "tr", label: "Turkey", group: "Europe" },
  { value: "jp", label: "Japan", group: "Asia" },
];

export const INTEREST_OPTIONS = [
  { value: "tech", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "gaming", label: "Gaming" },
];

export const TAKEN_EMAILS = new Set(["taken@example.com", "admin@example.com"]);

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "tr", label: "Turkish" },
];

export const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];
