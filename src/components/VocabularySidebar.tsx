import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Search, Trash2, X } from "lucide-react";

import { useLearnedWords } from "~/contexts/LearnedWordsContext";
import { useEscapeKey } from "~/hooks/useEscapeKey";
import {
  createLearnedWord,
  deleteLearnedWord,
  learnedWordsQueryOptions,
} from "~/utils/learned-words";

function VocabularySidebarContent() {
  const queryClient = useQueryClient();
  const {
    pendingWord,
    pendingTranslation,
    setPendingWord,
    setPendingTranslation,
    clearPending,
    lastFilledField,
  } = useLearnedWords();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const isSavingRef = useRef(false);

  const { data: words = [] } = useQuery(learnedWordsQueryOptions());

  useEffect(
    function debounceSearch() {
      const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
      return () => clearTimeout(timer);
    },
    [searchQuery],
  );

  const filteredWords = useMemo(
    function filterWords() {
      if (!debouncedQuery) return words;
      const q = debouncedQuery.toLowerCase();
      return words.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.translation.toLowerCase().includes(q),
      );
    },
    [words, debouncedQuery],
  );

  // Auto-save when both pending fields are filled
  useEffect(
    function autoSave() {
      if (!pendingWord || !pendingTranslation || isSavingRef.current) return;

      isSavingRef.current = true;
      void (async () => {
        try {
          await createLearnedWord({
            data: { word: pendingWord, translation: pendingTranslation },
          });
          clearPending();
          await queryClient.invalidateQueries({ queryKey: ["learned-words"] });
        } finally {
          isSavingRef.current = false;
        }
      })();
    },
    [pendingWord, pendingTranslation, clearPending, queryClient],
  );

  function handleSwap() {
    setPendingWord(pendingTranslation);
    setPendingTranslation(pendingWord);
  }

  async function handleDelete(id: number) {
    await deleteLearnedWord({ data: id });
    await queryClient.invalidateQueries({ queryKey: ["learned-words"] });
  }

  return (
    <>
      <header className="border-b border-sidebar-border px-4 py-3.5">
        <h2 className="text-[0.9375rem] font-semibold tracking-tight text-sidebar-foreground">
          Vocabulary
        </h2>
      </header>

      {/* Search */}
      <div className="border-b border-sidebar-border px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-sidebar-accent-foreground/80" />
          <input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-sidebar-border/70 bg-sidebar-accent py-1.5 pr-3 pl-8 text-sm text-sidebar-foreground placeholder:text-sidebar-accent-foreground/60 focus:border-sidebar-ring focus:ring-1 focus:ring-sidebar-ring focus:outline-none"
          />
        </div>
      </div>

      {/* Pending word form */}
      <div className="border-b border-sidebar-border px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <input
              type="text"
              placeholder="Word"
              value={pendingWord}
              onChange={(e) => setPendingWord(e.target.value)}
              className={`w-full rounded-md border border-sidebar-border/70 bg-sidebar-accent px-2.5 py-1.5 text-sm text-sidebar-foreground placeholder:text-sidebar-accent-foreground/60 focus:border-sidebar-ring focus:ring-1 focus:ring-sidebar-ring focus:outline-none ${
                lastFilledField === "word"
                  ? "animate-pulse ring-2 ring-blue-500/50"
                  : ""
              }`}
            />
            <input
              type="text"
              placeholder="Translation"
              value={pendingTranslation}
              onChange={(e) => setPendingTranslation(e.target.value)}
              className={`w-full rounded-md border border-sidebar-border/70 bg-sidebar-accent px-2.5 py-1.5 text-sm text-sidebar-foreground placeholder:text-sidebar-accent-foreground/60 focus:border-sidebar-ring focus:ring-1 focus:ring-sidebar-ring focus:outline-none ${
                lastFilledField === "translation"
                  ? "animate-pulse ring-2 ring-emerald-500/50"
                  : ""
              }`}
            />
          </div>
          <button
            type="button"
            onClick={handleSwap}
            className="shrink-0 rounded-md p-1.5 text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Swap word and translation"
          >
            <ArrowUpDown className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Word list */}
      <nav className="flex-1 overflow-y-auto p-2">
        {filteredWords.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent/40 px-4 py-8">
            <p className="text-center text-xs leading-relaxed text-sidebar-accent-foreground">
              {words.length === 0
                ? "Select text in chat and press W or T to save words"
                : "No words match your search"}
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filteredWords.map((word) => (
              <li key={word.id} className="group relative">
                <div className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors hover:border-sidebar-border/50 hover:bg-sidebar-accent">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] leading-snug font-semibold text-sidebar-foreground">
                      {word.word}
                    </p>
                    <p className="truncate text-xs leading-relaxed text-sidebar-accent-foreground">
                      {word.translation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(word.id)}
                    className="shrink-0 rounded p-0.5 text-sidebar-accent-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-sidebar-foreground"
                    aria-label="Delete word"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  );
}

type VocabularySidebarProps = {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function VocabularySidebar({
  isMobileOpen,
  onMobileClose,
}: VocabularySidebarProps) {
  useEscapeKey(!!isMobileOpen, () => onMobileClose?.());

  return (
    <>
      {/* Desktop */}
      <aside className="hidden h-full w-68 shrink-0 flex-col border-l border-sidebar-border bg-sidebar md:flex">
        <VocabularySidebarContent />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute right-0 flex h-full w-72 max-w-[85vw] animate-in flex-col bg-sidebar shadow-xl duration-200 slide-in-from-right">
            <button
              type="button"
              onClick={onMobileClose}
              className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-lg text-sidebar-accent-foreground hover:text-sidebar-foreground"
              aria-label="Close vocabulary sidebar"
            >
              <X className="size-4" />
            </button>
            <VocabularySidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
