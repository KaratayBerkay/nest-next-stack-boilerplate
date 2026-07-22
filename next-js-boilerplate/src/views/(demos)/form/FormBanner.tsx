interface FormBannerProps {
  type: "success" | "error";
  messages: string[];
}

export function FormBanner({ type, messages }: FormBannerProps) {
  if (messages.length === 0) return null;

  const isSuccess = type === "success";
  const border = isSuccess
    ? "border-green-300 dark:border-green-700"
    : "border-red-300 dark:border-red-700";
  const bg = isSuccess
    ? "bg-green-50 dark:bg-green-900/20"
    : "bg-red-50 dark:bg-red-900/20";
  const text = isSuccess
    ? "text-green-700 dark:text-green-400"
    : "text-red-700 dark:text-red-400";

  return (
    <div className={`rounded border ${border} ${bg} p-3 text-sm ${text}`}>
      {messages.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  );
}
