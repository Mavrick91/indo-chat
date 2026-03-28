import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatMessage } from "~/components/ChatMessage";

describe("ChatMessage", () => {
  it("does not render img tags from assistant markdown", () => {
    const markdownWithImage =
      "Here is an image: ![tracking pixel](https://evil.com/track.png)";

    render(
      <ChatMessage
        message={{ role: "assistant", content: markdownWithImage }}
      />,
    );

    const images = screen.queryAllByRole("img");
    expect(images).toHaveLength(0);
  });

  it("renders regular markdown elements correctly", () => {
    render(
      <ChatMessage
        message={{ role: "assistant", content: "**bold text** and `code`" }}
      />,
    );

    expect(screen.getByText("bold text")).toBeInTheDocument();
    expect(screen.getByText("code")).toBeInTheDocument();
  });

  it("preserves start attribute on ordered lists", () => {
    // Markdown: "3. Third\n4. Fourth" should render <ol start="3">
    render(
      <ChatMessage
        message={{ role: "assistant", content: "3. Third\n4. Fourth" }}
      />,
    );

    const ol = document.querySelector("ol");
    expect(ol).not.toBeNull();
    expect(ol?.getAttribute("start")).toBe("3");
  });

  it("renders user messages as plain text", () => {
    render(
      <ChatMessage
        message={{
          role: "user",
          content: "![image](https://evil.com/img.png)",
        }}
      />,
    );

    // User messages are plain text, not markdown — should show raw text
    expect(
      screen.getByText("![image](https://evil.com/img.png)"),
    ).toBeInTheDocument();
  });
});
