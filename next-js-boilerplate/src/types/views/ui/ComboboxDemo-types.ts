export interface AsyncDropdownProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: { value: string; label: string }[];
  loading: boolean;
  debouncedQuery: string;
  onSelect: (value: string) => void;
}

export interface CreatableDropdownProps {
  query: string;
  onQueryChange: (value: string) => void;
  filtered: { value: string; label: string }[];
  showCreate: boolean;
  onSelect: (value: string) => void;
  onCreate: () => void;
}

export interface SelectedItemProps {
  selectedLabel: string;
  onClear: () => void;
}

export interface ComboboxTriggerProps {
  selectedLabel: string;
  placeholder: string;
  onToggle: () => void;
}
