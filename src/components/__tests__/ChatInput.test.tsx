import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatInput } from "~/components/ChatInput";

describe("ChatInput", () => {
  it("does not submit when Enter is pressed during IME composition", async () => {
    const onSend = vi.fn();
    const onStop = vi.fn();

    render(<ChatInput onSend={onSend} onStop={onStop} isStreaming={false} />);

    const textarea = screen.getByRole("textbox");

    // Type some text first
    await userEvent.type(textarea, "Hello");

    // Simulate Enter keydown during IME composition (isComposing = true)
    textarea.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
        isComposing: true,
      }),
    );

    expect(onSend).not.toHaveBeenCalled();
  });

  it("submits when Enter is pressed outside IME composition", async () => {
    const onSend = vi.fn();
    const onStop = vi.fn();

    render(<ChatInput onSend={onSend} onStop={onStop} isStreaming={false} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Hello{enter}");

    expect(onSend).toHaveBeenCalledWith("Hello");
  });
});
