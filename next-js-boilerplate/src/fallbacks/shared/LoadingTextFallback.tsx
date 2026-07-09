export function LoadingTextFallback({ text = "Loading..." }: { text?: string } = {}) {
  return <p className="text-sm text-zinc-500">{text}</p>;
}
