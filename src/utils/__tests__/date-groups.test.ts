import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ConversationSummary,
  groupConversationsByDate,
} from "~/utils/date-groups";

const makeConversation = (id: number, createdAt: Date): ConversationSummary => ({
  id,
  title: `Conversation ${id}`,
  createdAt,
  updatedAt: createdAt,
});

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

describe("groupConversationsByDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns empty array for empty input", () => {
    const result = groupConversationsByDate([]);
    expect(result).toEqual([]);
  });

  it("groups a conversation from today", () => {
    const conversations = [makeConversation(1, daysAgo(0))];
    const result = groupConversationsByDate(conversations);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Today");
    expect(result[0].conversations).toHaveLength(1);
  });

  it.each([
    [1, "Yesterday"],
    [3, "Last 7 days"],
    [10, "Last 30 days"],
    [40, "Older"],
  ] as const)("groups a conversation from %i days ago into '%s'", (days, label) => {
    const result = groupConversationsByDate([makeConversation(1, daysAgo(days))]);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe(label);
  });

  it("distributes conversations across all groups", () => {
    const conversations = [
      makeConversation(1, daysAgo(0)),
      makeConversation(2, daysAgo(1)),
      makeConversation(3, daysAgo(3)),
      makeConversation(4, daysAgo(10)),
      makeConversation(5, daysAgo(40)),
    ];

    const result = groupConversationsByDate(conversations);

    expect(result).toHaveLength(5);
    expect(result[0].label).toBe("Today");
    expect(result[1].label).toBe("Yesterday");
    expect(result[2].label).toBe("Last 7 days");
    expect(result[3].label).toBe("Last 30 days");
    expect(result[4].label).toBe("Older");
  });

  it("omits empty groups", () => {
    const conversations = [
      makeConversation(1, daysAgo(0)),
      makeConversation(2, daysAgo(40)),
    ];

    const result = groupConversationsByDate(conversations);

    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("Today");
    expect(result[1].label).toBe("Older");
  });

  it("handles string dates from network serialization", () => {
    // After JSON serialization, dates become ISO strings.
    // groupConversationsByDate must handle this gracefully.
    const stringDate = "2024-06-15T12:00:00.000Z" as unknown as Date;

    const conversations = [
      {
        id: 1,
        title: "String date conv",
        createdAt: stringDate,
        updatedAt: stringDate,
      },
    ];

    const result = groupConversationsByDate(conversations);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Today");
  });

  it("groups multiple conversations in the same bucket", () => {
    const conversations = [
      makeConversation(1, daysAgo(0)),
      makeConversation(2, daysAgo(0)),
      makeConversation(3, daysAgo(0)),
    ];

    const result = groupConversationsByDate(conversations);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("Today");
    expect(result[0].conversations).toHaveLength(3);
  });
});
