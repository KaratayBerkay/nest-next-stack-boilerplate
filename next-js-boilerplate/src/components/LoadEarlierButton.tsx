export function LoadEarlierButton({
  onClick,
  compact,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex justify-center ${compact ? "py-2" : "py-3"}`}>
      <button
        onClick={onClick}
        className={`bg-surface hover:bg-surface-hover text-muted font-medium ${
          compact ? "rounded px-3 py-1 text-xs" : "rounded-lg px-4 py-2 text-xs"
        }`}
      >
        Load earlier messages
      </button>
    </div>
  );
}
