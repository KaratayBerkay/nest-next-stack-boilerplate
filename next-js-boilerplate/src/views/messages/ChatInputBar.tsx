import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button/icon-button";
import { IconPaperclip, IconSend } from "@tabler/icons-react";

export interface ChatInputBarProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  messageError: string | null;
  handleSend: () => void;
  connectionState: string;
  inputPlaceholder: string;
  connectingLabel: string;
}

export function ChatInputBar({
  input,
  setInput,
  messageError,
  handleSend,
  connectionState,
  inputPlaceholder,
  connectingLabel,
}: ChatInputBarProps) {
  return (
    <div className="flex items-end gap-3 border-t px-5 py-4">
      <IconButton
        icon={<IconPaperclip size={20} />}
        label="Attach file"
        variant="ghost"
        size="icon-sm"
        disabled
        className="text-muted shrink-0"
      />
      <div className="flex flex-1 flex-col">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            connectionState === "online" ? inputPlaceholder : connectingLabel
          }
          disabled={connectionState !== "online"}
          className="bg-surface text-fg placeholder:text-muted focus:ring-brand/30 w-full rounded-lg border-0 px-4 py-3 text-sm focus:ring-1 focus:outline-none"
        />
        {messageError && (
          <p className="text-error mt-1.5 text-xs">{messageError}</p>
        )}
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={handleSend}
        disabled={connectionState !== "online" || !input.trim()}
        className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-3"
      >
        <span className="hidden sm:inline">Send</span>
        <IconSend size={16} />
      </Button>
    </div>
  );
}
