interface SelectedItemProps {
  selectedLabel: string;
  onClear: () => void;
}

export function SelectedItem({ selectedLabel, onClear }: SelectedItemProps) {
  return (
    <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
      <span className="text-sm">
        Selected: <strong>{selectedLabel}</strong>
      </span>
      <button
        type="button"
        onClick={onClear}
        className="text-muted hover:text-fg p-0.5"
      >
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
      </button>
    </div>
  );
}
