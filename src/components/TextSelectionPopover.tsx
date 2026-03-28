import { useCallback, useEffect, useRef, useState } from "react";

import { useLearnedWords } from "~/contexts/LearnedWordsContext";

type PopoverPosition = {
  x: number;
  y: number;
  isArrowDown: boolean;
};

export function TextSelectionPopover({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setPendingWord, setPendingTranslation } = useLearnedWords();
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const selectedTextRef = useRef("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(function dismiss() {
    setPosition(null);
    selectedTextRef.current = "";
  }, []);

  const handleMouseUp = useCallback(function handleMouseUp() {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";

      if (!text || !selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const popoverHeight = 40;
      const gap = 8;
      const isArrowDown = rect.top - popoverHeight - gap > 0;

      const x = rect.left + rect.width / 2;
      const y = isArrowDown ? rect.top - gap : rect.bottom + gap;

      selectedTextRef.current = text;
      setPosition({ x, y, isArrowDown });
    });
  }, []);

  useEffect(
    function registerOutsideClickListener() {
      if (!position) return;

      function handleMouseDown(e: MouseEvent) {
        if (
          popoverRef.current &&
          popoverRef.current.contains(e.target as Node)
        ) {
          return;
        }
        dismiss();
      }

      document.addEventListener("mousedown", handleMouseDown);
      return () => document.removeEventListener("mousedown", handleMouseDown);
    },
    [position, dismiss],
  );

  function handleAction(setter: (text: string) => void) {
    setter(selectedTextRef.current);
    dismiss();
  }

  return (
    <div onMouseUp={handleMouseUp}>
      {children}
      {position && (
        <div
          ref={popoverRef}
          className="fixed z-50 flex items-center gap-1 rounded-lg bg-popover px-1.5 py-1 shadow-lg"
          style={{
            left: position.x,
            top: position.y,
            transform: position.isArrowDown
              ? "translate(-50%, -100%)"
              : "translate(-50%, 0)",
          }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={
              position.isArrowDown
                ? {
                    bottom: -5,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: "5px solid var(--popover)",
                  }
                : {
                    top: -5,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderBottom: "5px solid var(--popover)",
                  }
            }
          />
          <button
            type="button"
            onClick={() => handleAction(setPendingWord)}
            className="rounded-md bg-blue-500/15 px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-500/25 dark:text-blue-400"
          >
            W
          </button>
          <button
            type="button"
            onClick={() => handleAction(setPendingTranslation)}
            className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/25 dark:text-emerald-400"
          >
            T
          </button>
        </div>
      )}
    </div>
  );
}
