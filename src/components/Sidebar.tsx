import { useEffect, useRef, useState } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useMatchRoute, useRouter } from "@tanstack/react-router";
import { Menu, MessageSquarePlus, SquarePen, Trash2, X } from "lucide-react";

import { APP_NAME } from "~/config/app";
import { useEscapeKey } from "~/hooks/useEscapeKey";
import {
  conversationsListQueryOptions,
  deleteConversation,
  updateConversation,
} from "~/utils/conversations";
import {
  type ConversationSummary,
  groupConversationsByDate,
} from "~/utils/date-groups";

const INITIAL_VISIBLE = 5;

type ConversationItemProps = {
  conv: ConversationSummary;
  onDeleted: () => void;
};

function ConversationItem({ conv, onDeleted }: ConversationItemProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setEditTitle(conv.title);
    setIsEditing(true);
  };

  const handleRenameSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const trimmed = editTitle.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== conv.title) {
      await updateConversation({ data: { id: conv.id, title: trimmed } });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }

    isSubmittingRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleRenameSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteConversation({ data: conv.id });
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    onDeleted();
  };

  return (
    <li className="group relative">
      <Link
        to="/chat/$id"
        params={{ id: String(conv.id) }}
        activeProps={{ className: "bg-sidebar-accent" }}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => void handleRenameSubmit()}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.preventDefault()}
            className="min-w-0 flex-1 truncate rounded bg-transparent px-0.5 text-sm text-sidebar-foreground ring-1 ring-sidebar-border outline-none"
          />
        ) : (
          <span
            className="min-w-0 flex-1 truncate"
            onDoubleClick={handleDoubleClick}
          >
            {conv.title}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => void handleDelete(e)}
          className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-sidebar-foreground"
          aria-label="Delete conversation"
        >
          <Trash2 className="size-3.5" />
        </button>
      </Link>
    </li>
  );
}

type DateGroupSectionProps = {
  label: string;
  conversations: ConversationSummary[];
  onDeleted: (id: number) => void;
};

function DateGroupSection({
  label,
  conversations,
  onDeleted,
}: DateGroupSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visible = isExpanded
    ? conversations
    : conversations.slice(0, INITIAL_VISIBLE);
  const hasMore = conversations.length > INITIAL_VISIBLE;

  return (
    <section>
      <h3 className="px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground">
        {label}
      </h3>
      <ul className="space-y-0.5">
        {visible.map((conv) => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            onDeleted={() => onDeleted(conv.id)}
          />
        ))}
      </ul>
      {hasMore && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-1 w-full px-3 py-1 text-left text-xs text-muted-foreground hover:text-sidebar-foreground"
        >
          Show {conversations.length - INITIAL_VISIBLE} more
        </button>
      )}
    </section>
  );
}

type SidebarContentProps = {
  onNavigate?: () => void;
};

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { data } = useSuspenseQuery(conversationsListQueryOptions());
  const router = useRouter();
  const matchRoute = useMatchRoute();
  const groups = groupConversationsByDate(
    data.conversations as ConversationSummary[],
  );

  const handleDeleted = (id: number) => {
    if (matchRoute({ to: "/chat/$id", params: { id: String(id) } })) {
      void router.navigate({ to: "/" });
    }
  };

  return (
    <>
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
        <Link
          to="/"
          onClick={onNavigate}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="New chat"
        >
          <SquarePen className="size-4" />
        </Link>
      </header>
      <nav className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sidebar-border/80 bg-sidebar-accent/30 px-4 py-8">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Conversation history will appear here
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <DateGroupSection
              key={group.label}
              label={group.label}
              conversations={group.conversations}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </nav>
    </>
  );
}

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobile = () => setIsMobileOpen(false);

  useEscapeKey(isMobileOpen, closeMobile);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-3 left-3 z-40 flex size-9 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-md md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>

      <aside className="hidden h-full w-68 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] animate-in flex-col bg-sidebar shadow-xl duration-200 slide-in-from-left">
            <button
              type="button"
              onClick={closeMobile}
              className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-sidebar-foreground"
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={closeMobile} />
          </aside>
        </div>
      )}
    </>
  );
}
