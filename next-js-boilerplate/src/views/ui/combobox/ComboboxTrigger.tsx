interface ComboboxTriggerProps {
  selectedLabel: string;
  placeholder: string;
  onToggle: () => void;
}

export function ComboboxTrigger({
  selectedLabel,
  placeholder,
  onToggle,
}: ComboboxTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="focus-visible:ring-brand border-border bg-bg text-fg flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="truncate">
        {selectedLabel || placeholder}
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="ml-2 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
