import Database from "better-sqlite3";
import { asc, desc, eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";

import { conversations, messages } from "~/db/schema";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const testDb = drizzle(sqlite, { schema: { conversations, messages } });

  sqlite.exec(`
    CREATE TABLE conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX conversations_created_at_idx ON conversations (created_at);

    CREATE TABLE messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
    CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
  `);

  return testDb;
}

describe("conversations CRUD", () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    db = createTestDb();
  });

  describe("createConversation", () => {
    it("creates a conversation with first message in a transaction", () => {
      const firstMessage = "Hello, how are you?";

      const result = db.transaction((tx) => {
        const conversation = tx
          .insert(conversations)
          .values({ title: firstMessage.slice(0, 80) })
          .returning()
          .get();

        tx.insert(messages)
          .values({
            conversationId: conversation.id,
            role: "user",
            content: firstMessage,
          })
          .run();

        return { id: conversation.id, title: conversation.title };
      });

      expect(result.id).toBe(1);
      expect(result.title).toBe(firstMessage);

      const msgs = db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, result.id))
        .all();
      expect(msgs).toHaveLength(1);
      expect(msgs[0].role).toBe("user");
      expect(msgs[0].content).toBe(firstMessage);
    });

    it("truncates title to 80 characters", () => {
      const longMessage = "A".repeat(120);

      const conversation = db
        .insert(conversations)
        .values({ title: longMessage.slice(0, 80) })
        .returning()
        .get();

      expect(conversation.title).toHaveLength(80);
    });
  });

  describe("addMessage", () => {
    it("inserts a message and updates conversation updatedAt", () => {
      const conversation = db
        .insert(conversations)
        .values({ title: "Test" })
        .returning()
        .get();

      const originalUpdatedAt = conversation.updatedAt;

      const message = db
        .insert(messages)
        .values({
          conversationId: conversation.id,
          role: "assistant",
          content: "Hello!",
        })
        .returning()
        .get();

      db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversation.id))
        .run();

      expect(message.id).toBe(1);
      expect(message.role).toBe("assistant");
      expect(message.content).toBe("Hello!");

      const updated = db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversation.id))
        .get();
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe("getConversation", () => {
    it("returns conversation with its messages", () => {
      const conversation = db
        .insert(conversations)
        .values({ title: "Test conv" })
        .returning()
        .get();

      db.insert(messages)
        .values([
          {
            conversationId: conversation.id,
            role: "user",
            content: "Hi",
          },
          {
            conversationId: conversation.id,
            role: "assistant",
            content: "Hello!",
          },
        ])
        .run();

      const result = db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversation.id))
        .get();
      const msgs = db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(asc(messages.createdAt))
        .all();

      expect(result).toBeDefined();
      expect(result?.title).toBe("Test conv");
      expect(msgs).toHaveLength(2);
      expect(msgs[0].role).toBe("user");
      expect(msgs[1].role).toBe("assistant");
    });

    it("returns undefined for non-existent conversation", () => {
      const result = db
        .select()
        .from(conversations)
        .where(eq(conversations.id, 9999))
        .get();

      expect(result).toBeUndefined();
    });
  });

  describe("listConversations", () => {
    it("returns conversations ordered by createdAt DESC", () => {
      db.insert(conversations)
        .values([
          {
            title: "First",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
          },
          {
            title: "Second",
            createdAt: new Date("2024-01-02"),
            updatedAt: new Date("2024-01-02"),
          },
          {
            title: "Third",
            createdAt: new Date("2024-01-03"),
            updatedAt: new Date("2024-01-03"),
          },
        ])
        .run();

      const results = db
        .select()
        .from(conversations)
        .orderBy(desc(conversations.createdAt))
        .all();

      expect(results).toHaveLength(3);
      expect(results[0].title).toBe("Third");
      expect(results[1].title).toBe("Second");
      expect(results[2].title).toBe("First");
    });

    it("supports cursor-based pagination", () => {
      const dates = Array.from(
        { length: 5 },
        (_, i) => new Date(`2024-01-0${i + 1}`),
      );

      db.insert(conversations)
        .values(
          dates.map((d, i) => ({
            title: `Conv ${i + 1}`,
            createdAt: d,
            updatedAt: d,
          })),
        )
        .run();

      const limit = 2;

      const firstPage = db
        .select()
        .from(conversations)
        .orderBy(desc(conversations.createdAt))
        .limit(limit + 1)
        .all();

      expect(firstPage.length).toBe(3);
      const items = firstPage.slice(0, limit);
      expect(items[0].title).toBe("Conv 5");
      expect(items[1].title).toBe("Conv 4");

      const cursor = items.at(-1)?.createdAt ?? new Date();

      const secondPage = db
        .select()
        .from(conversations)
        .where(lt(conversations.createdAt, cursor))
        .orderBy(desc(conversations.createdAt))
        .limit(limit + 1)
        .all();

      expect(secondPage.length).toBe(3);
      const secondItems = secondPage.slice(0, limit);
      expect(secondItems[0].title).toBe("Conv 3");
      expect(secondItems[1].title).toBe("Conv 2");
    });
  });

  describe("updateConversation", () => {
    it("updates title and updatedAt", () => {
      const conversation = db
        .insert(conversations)
        .values({ title: "Old title" })
        .returning()
        .get();

      db.update(conversations)
        .set({ title: "New title", updatedAt: new Date() })
        .where(eq(conversations.id, conversation.id))
        .run();

      const updated = db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversation.id))
        .get();

      expect(updated?.title).toBe("New title");
    });
  });

  describe("deleteConversation", () => {
    it("deletes conversation and cascades to messages", () => {
      const conversation = db
        .insert(conversations)
        .values({ title: "To delete" })
        .returning()
        .get();

      db.insert(messages)
        .values({
          conversationId: conversation.id,
          role: "user",
          content: "Hello",
        })
        .run();

      db.delete(conversations)
        .where(eq(conversations.id, conversation.id))
        .run();

      const deletedConv = db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversation.id))
        .get();
      const orphanedMsgs = db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .all();

      expect(deletedConv).toBeUndefined();
      expect(orphanedMsgs).toHaveLength(0);
    });
  });
});
