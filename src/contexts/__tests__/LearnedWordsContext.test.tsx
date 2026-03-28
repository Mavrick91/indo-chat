import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LearnedWordsProvider,
  useLearnedWords,
} from "~/contexts/LearnedWordsContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <LearnedWordsProvider>{children}</LearnedWordsProvider>;
}

describe("LearnedWordsContext", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears the timer on unmount to prevent memory leaks", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    const { result, unmount } = renderHook(() => useLearnedWords(), {
      wrapper,
    });

    // Trigger a timer by setting a pending word
    act(() => {
      result.current.setPendingWord("hello");
    });

    // Unmount should clear the pending timer
    unmount();

    // clearTimeout should have been called on unmount
    // (once during setPendingWord to clear prev, and once on unmount cleanup)
    const callCount = clearTimeoutSpy.mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(2);

    vi.useRealTimers();
  });
});
