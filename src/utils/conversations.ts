import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq, lt } from "drizzle-orm";

import { db } from "~/db";
import { conversations, messages } from "~/db/schema";

export const createConversation = createServerFn({ method: "POST" })
  .inputValidator((data: { firstMessage: string }) => data)
  .handler(({ data }) => {
    const title = data.firstMessage.slice(0, 80);

    return db.transaction((tx) => {
      const conversation = tx
        .insert(conversations)
        .values({ title })
        .returning()
        .get();

      tx.insert(messages)
        .values({
          conversationId: conversation.id,
          role: "user",
          content: data.firstMessage,
        })
        .run();

      return { id: conversation.id, title: conversation.title };
    });
  });

export const addMessage = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      conversationId: number;
      role: "user" | "assistant";
      content: string;
    }) => data,
  )
  .handler(({ data }) => {
    const message = db
      .insert(messages)
      .values({
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
      })
      .returning()
      .get();

    db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, data.conversationId))
      .run();

    return { id: message.id };
  });

export const getConversation = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(({ data }) => {
    const id = Number(data);
    const [conversation] = db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)
      .all();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- conversation can be undefined at runtime
    if (!conversation) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router expects notFound() to be thrown
      throw notFound();
    }

    const conversationMessages = db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt))
      .all();

    return { conversation, messages: conversationMessages };
  });

export const listConversations = createServerFn({ method: "GET" })
  .inputValidator((data: { cursor?: string; limit?: number }) => data)
  .handler(({ data }) => {
    const limit = data.limit ?? 50;
    let cursorDate: Date | null = null;
    if (data.cursor) {
      const parsed = new Date(data.cursor);
      if (!Number.isNaN(parsed.getTime())) {
        cursorDate = parsed;
      }
    }

    let query = db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))
      .limit(limit + 1)
      .$dynamic();

    if (cursorDate) {
      query = query.where(lt(conversations.createdAt, cursorDate));
    }

    const results = query.all();

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? items.at(-1)?.createdAt.toISOString() : null;

    return { conversations: items, nextCursor };
  });

export const updateConversation = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; title: string }) => data)
  .handler(({ data }) => {
    db.update(conversations)
      .set({ title: data.title, updatedAt: new Date() })
      .where(eq(conversations.id, data.id))
      .run();
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(({ data }) => {
    db.delete(conversations).where(eq(conversations.id, data)).run();
  });

export const conversationQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["conversation", id],
    queryFn: () => getConversation({ data: id }),
  });

export const conversationsListQueryOptions = () =>
  queryOptions({
    queryKey: ["conversations"],
    queryFn: () => listConversations({ data: {} }),
  });
