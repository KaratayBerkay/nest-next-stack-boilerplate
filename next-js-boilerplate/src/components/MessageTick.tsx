export function MessageTick({
  status,
}: {
  status: "sent" | "delivered" | "read";
}) {
  if (status === "read") {
    return (
      <svg
        viewBox="0 0 20 11"
        width="17"
        height="11"
        className="fill-current text-blue-400 drop-shadow-sm"
        data-testid="tick-read"
      >
        <path d="M5.5 7.5 2.5 4.5l-1 1 4 4 9-9-1-1z" />
        <path d="M11.5 7.5 8.5 4.5l-1 1 4 4 4-4-1-1z" />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg
        viewBox="0 0 20 11"
        width="17"
        height="11"
        className="fill-current text-white/80"
        data-testid="tick-delivered"
      >
        <path d="M5.5 7.5 2.5 4.5l-1 1 4 4 9-9-1-1z" />
        <path d="M11.5 7.5 8.5 4.5l-1 1 4 4 4-4-1-1z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 12 11"
      width="15"
      height="11"
      className="fill-current text-white/40"
      data-testid="tick-sent"
    >
      <path d="M5.5 8 1.5 4l-1 1 5 5 9-9-1-1z" />
    </svg>
  );
}
