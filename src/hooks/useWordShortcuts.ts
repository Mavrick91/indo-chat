import { useEffect } from "react";

import { useLearnedWords } from "~/contexts/LearnedWordsContext";

export function useWordShortcuts() {
  const { setPendingWord, setPendingTranslation } = useLearnedWords();

  useEffect(
    function registerKeyboardShortcuts() {
      function handleKeyDown(e: KeyboardEvent) {
        if (!e.metaKey || !e.shiftKey) return;

        if (e.key !== "1" && e.key !== "2") return;

        e.preventDefault();
        const text = window.getSelection()?.toString().trim();
        if (!text) return;

        if (e.key === "1") setPendingWord(text);
        else setPendingTranslation(text);
      }

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    },
    [setPendingWord, setPendingTranslation],
  );
}
