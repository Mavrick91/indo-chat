import { MessageSquarePlus } from "lucide-react";

import { APP_NAME } from "~/config/app";

export function Sidebar() {
  return (
    <aside className="flex h-full w-68 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <header className="flex items-center gap-3 border-b border-sidebar-border px-4 py-3.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground">
          <MessageSquarePlus className="size-4.5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[0.9375rem] font-semibold tracking-tight text-sidebar-foreground">
            {APP_NAME}
          </h1>
          <p className="text-xs text-muted-foreground">Assistant</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sidebar-border/80 bg-sidebar-accent/30 px-4 py-8">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Conversation history will appear here
          </p>
        </div>
      </div>
    </aside>
  );
}
