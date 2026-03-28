import { useCallback, useEffect, useRef, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { ChatInput } from "~/components/ChatInput";
import { ChatMessage } from "~/components/ChatMessage";
import { Sidebar } from "~/components/Sidebar";
import { APP_NAME } from "~/config/app";
import { type Message, sendMessage } from "~/utils/chat";

export const Route = createFileRoute("/")({
  component: Chat,
});

type ChatMessageWithId = Message & { id: string };

let messageIdCounter = 0;
function nextMessageId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessageWithId[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    (content: string) => {
      const userMessage: ChatMessageWithId = {
        id: nextMessageId(),
        role: "user",
        content,
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);
      setStreamingContent("");

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      void (async () => {
        try {
          const stream = await sendMessage({
            data: { messages: updatedMessages },
          });

          if (!(stream instanceof ReadableStream)) {
            // eslint-disable-next-line no-console
            console.error(
              "Expected ReadableStream but received:",
              typeof stream,
            );
            return;
          }

          const reader = (stream as ReadableStream<Uint8Array>).getReader();
          const decoder = new TextDecoder();
          let fullContent = "";

          for (;;) {
            if (abortController.signal.aborted) break;

            const result = await reader.read();
            if (result.done) break;

            const text = decoder.decode(result.value, { stream: true });
            fullContent += text;
            setStreamingContent(fullContent);
          }

          if (!abortController.signal.aborted) {
            setMessages((prev) => [
              ...prev,
              {
                id: nextMessageId(),
                role: "assistant",
                content: fullContent,
              },
            ]);
          }
        } catch (error) {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            // eslint-disable-next-line no-console
            console.error("Chat error:", error);
          }
        } finally {
          setIsStreaming(false);
          setStreamingContent("");
          abortControllerRef.current = null;
        }
      })();
    },
    [messages],
  );

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  const hasThread = messages.length > 0 || streamingContent.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="relative flex min-w-0 flex-1 flex-col bg-linear-to-b from-background via-background to-muted/25">
        <header className="shrink-0 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/75 md:hidden">
          <h2 className="text-center text-sm font-medium tracking-tight text-foreground">
            Chat
          </h2>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col px-3 pt-3 md:px-5 md:pt-5">
          {/* Scrollable reading surface — inset panel */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card/40 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] md:rounded-3xl dark:bg-card/25 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth [scrollbar-gutter:stable]">
              <div
                className={
                  hasThread
                    ? "mx-auto max-w-3xl px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-32"
                    : "mx-auto flex min-h-[min(60vh,32rem)] max-w-3xl flex-col justify-center px-4 py-12 md:px-8"
                }
              >
                {hasThread ? (
                  <ul className="flex flex-col gap-10 md:gap-12">
                    {messages.map((message) => (
                      <li key={message.id}>
                        <ChatMessage message={message} />
                      </li>
                    ))}
                    {streamingContent && (
                      <li key="streaming">
                        <ChatMessage
                          message={{
                            role: "assistant",
                            content: streamingContent,
                          }}
                        />
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="pb-28 text-center md:pb-32">
                    <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                      {APP_NAME}
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
                      What should we work on?
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
                      Type below to begin. This session only lasts until you
                      refresh the page.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Floating composer — overlaps the panel; not a full-width strip */}
          <div className="pointer-events-none relative z-20 -mt-14 flex justify-center px-1 pb-3 md:-mt-16 md:pb-4">
            <div className="pointer-events-auto w-full max-w-3xl">
              <ChatInput
                onSend={handleSend}
                onStop={handleStop}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
