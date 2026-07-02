export function OnlineDot({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <span
      className={`absolute -right-0.5 -bottom-0.5 rounded-full border-2 border-white bg-green-500 ${className}`}
    />
  );
}
