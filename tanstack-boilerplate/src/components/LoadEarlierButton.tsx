import { Button } from "@/components/ui/Button";
import type { LoadEarlierButtonProps } from "@/types/components/LoadEarlierButton-types";

export function LoadEarlierButton({
  onClick,
  compact,
}: LoadEarlierButtonProps) {
  return (
    <div className={`flex justify-center ${compact ? "py-2" : "py-3"}`}>
      <Button
        variant="secondary"
        size={compact ? "xs" : "sm"}
        onClick={onClick}
      >
        Load earlier messages
      </Button>
    </div>
  );
}
