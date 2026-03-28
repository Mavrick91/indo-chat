import { useEffect } from "react";

export function useEscapeKey(isActive: boolean, onClose: () => void) {
  useEffect(
    function registerEscapeKeyListener() {
      if (!isActive) return;
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") onClose();
      }
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    },
    [isActive, onClose],
  );
}
