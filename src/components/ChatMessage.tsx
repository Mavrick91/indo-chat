import type { Components } from "react-markdown";
import Markdown from "react-markdown";

import type { Message } from "~/utils/chat";

const assistantMarkdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-3 text-[0.9375rem] leading-relaxed text-foreground last:mb-0 [&+p]:mt-3">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-[0.9375rem] leading-relaxed last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ node: _node, children, ...props }) => (
    <ol
      {...props}
      className="mb-3 list-decimal space-y-1 pl-5 text-[0.9375rem] leading-relaxed last:mb-0"
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="marker:text-muted-foreground">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
      rel="noreferrer"
      target={href?.startsWith("http") ? "_blank" : undefined}
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-muted/80 px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl border border-border/80 bg-muted/40 p-3 text-[0.8125rem] leading-relaxed last:mb-0 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  h1: ({ children }) => (
    <h1 className="mb-2 text-base font-semibold tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 text-[0.9375rem] font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 text-[0.875rem] font-semibold">{children}</h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-primary/30 pl-3 text-muted-foreground last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-border" />,
};

type Props = { message: Message };

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[min(100%,85%)] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
          <p className="leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      className="w-full border-l-2 border-primary/25 pl-5 md:pl-6"
      aria-label="Assistant message"
    >
      <div className="markdown-body">
        <Markdown
          components={assistantMarkdownComponents}
          disallowedElements={["img"]}
        >
          {message.content}
        </Markdown>
      </div>
    </article>
  );
}
