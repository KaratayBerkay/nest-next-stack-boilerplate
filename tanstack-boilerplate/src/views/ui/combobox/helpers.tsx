import type { GroupedOption } from "./data";
import { CommandGroup, CommandItem } from "@/components/ui/Command";

export function getLabel(
  value: string,
  options: { value: string; label: string }[],
): string {
  return options.find((o) => o.value === value)?.label ?? "";
}

export function filterGroups(
  data: GroupedOption[],
  query: string,
): GroupedOption[] {
  if (!query) return data;
  const lower = query.toLowerCase();
  return data
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(lower)),
    }))
    .filter((g) => g.items.length > 0);
}

export function getAllItems(
  data: GroupedOption[],
): { value: string; label: string }[] {
  return data.flatMap((g) => g.items);
}

export function toggleItem(values: string[], item: string): string[] {
  return values.includes(item)
    ? values.filter((v) => v !== item)
    : [...values, item];
}

export function renderGroupedItems(
  data: GroupedOption[],
  query: string,
  onSelect: (value: string) => void,
) {
  const filtered = filterGroups(data, query);
  if (filtered.length === 0) {
    return (
      <div className="text-muted py-6 text-center text-sm">No results</div>
    );
  }
  return filtered.map((group) => (
    <CommandGroup key={group.group} heading={group.group}>
      {group.items.map((item) => (
        <CommandItem
          key={item.value}
          value={item.value}
          onSelect={() => onSelect(item.value)}
        >
          {item.label}
        </CommandItem>
      ))}
    </CommandGroup>
  ));
}
