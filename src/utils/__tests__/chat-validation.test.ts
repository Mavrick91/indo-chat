import { describe, expect, it } from "vitest";

import { type Message, validateMessages } from "~/utils/chat";

describe("validateMessages", () => {
  it("accepts valid messages", () => {
    const messages: Message[] = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
    ];

    expect(() => {
      validateMessages(messages);
    }).not.toThrow();
  });

  it("rejects empty messages array", () => {
    expect(() => {
      validateMessages([]);
    }).toThrow();
  });

  it("rejects messages with empty content", () => {
    const messages: Message[] = [{ role: "user", content: "" }];

    expect(() => {
      validateMessages(messages);
    }).toThrow();
  });

  it("rejects messages with invalid role", () => {
    const messages = [{ role: "system" as "user", content: "You are helpful" }];

    expect(() => {
      validateMessages(messages);
    }).toThrow();
  });

  it("rejects messages exceeding max count", () => {
    const messages: Message[] = Array.from({ length: 201 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));

    expect(() => {
      validateMessages(messages);
    }).toThrow();
  });

  it("rejects messages with content exceeding max length", () => {
    const messages: Message[] = [
      { role: "user", content: "x".repeat(100_001) },
    ];

    expect(() => {
      validateMessages(messages);
    }).toThrow();
  });
});
