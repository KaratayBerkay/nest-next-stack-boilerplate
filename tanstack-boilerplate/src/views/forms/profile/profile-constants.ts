import { formOptions } from "@tanstack/react-form";
import { profileDefaultValues } from "@/validators/forms/profile-inits";

export const profileFormOpts = formOptions({
  defaultValues: profileDefaultValues,
});

export function getCountryOptions(t: Record<string, string>) {
  return [
    { value: "us", label: t.countryUs, group: t.groupNorthAmerica },
    { value: "ca", label: t.countryCa, group: t.groupNorthAmerica },
    { value: "gb", label: t.countryGb, group: t.groupEurope },
    { value: "de", label: t.countryDe, group: t.groupEurope },
    { value: "tr", label: t.countryTr, group: t.groupEurope },
    { value: "jp", label: t.countryJp, group: t.groupAsia },
  ];
}

export function getInterestOptions(t: Record<string, string>) {
  return [
    { value: "tech", label: t.interestTech },
    { value: "design", label: t.interestDesign },
    { value: "music", label: t.interestMusic },
    { value: "sports", label: t.interestSports },
    { value: "gaming", label: t.interestGaming },
  ];
}

export const TAKEN_EMAILS = new Set(["taken@example.com", "admin@example.com"]);

export function getLanguageOptions(t: Record<string, string>) {
  return [
    { value: "en", label: t.languageEn },
    { value: "tr", label: t.languageTr },
  ];
}

export function getRoleOptions(t: Record<string, string>) {
  return [
    { value: "user", label: t.roleUser },
    { value: "editor", label: t.roleEditor },
    { value: "admin", label: t.roleAdmin },
  ];
}
