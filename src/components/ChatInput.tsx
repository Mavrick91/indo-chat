import { useRef } from "react";

import { ArrowUp, Square } from "lucide-react";

import { Button } from "~/components/ui/button";

type ChatInputProps = {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
};

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const value = textareaRef.current?.value.trim();
    if (!value || isStreaming) return;
    onSend(value);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card/90 p-2 shadow-[0_12px_40px_-12px_oklch(0_0_0/0.25)] ring-1 ring-black/4 backdrop-blur-xl dark:bg-card/80 dark:shadow-[0_12px_48px_-12px_oklch(0_0_0/0.5)] dark:ring-white/6">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          placeholder="Ask anything…"
          rows={1}
          aria-label="Message"
          className="max-h-50 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        {isStreaming ? (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="mb-0.5 shrink-0  rounded-xl"
            aria-label="Stop generating"
            onClick={onStop}
          >
            <Square className="size-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="mb-0.5 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            aria-label="Send message"
            onClick={handleSubmit}
          >
            <ArrowUp className="size-4" strokeWidth={2.25} />
          </Button>
        )}
      </div>
      <p className="px-3 pb-1.5 text-[0.65rem] text-muted-foreground">
        <span className="tabular-nums">Enter</span> to send ·{" "}
        <span className="tabular-nums">Shift+Enter</span> newline
      </p>
    </div>
  );
}
