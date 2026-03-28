import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq, like, or } from "drizzle-orm";

import { db } from "~/db";
import { learnedWords } from "~/db/schema";

export const listLearnedWords = createServerFn({ method: "GET" })
  .inputValidator((data: Record<string, never>) => data)
  .handler(() => {
    return db
      .select()
      .from(learnedWords)
      .orderBy(desc(learnedWords.createdAt))
      .all();
  });

export function validateLearnedWordInput(data: {
  word: string;
  translation: string;
}): { word: string; translation: string } {
  const word = data.word.trim();
  const translation = data.translation.trim();

  if (!word) {
    throw new Error("Word must not be empty");
  }
  if (!translation) {
    throw new Error("Translation must not be empty");
  }

  return { word, translation };
}

export const createLearnedWord = createServerFn({ method: "POST" })
  .inputValidator((data: { word: string; translation: string }) => {
    return validateLearnedWordInput(data);
  })
  .handler(({ data }) => {
    return db.insert(learnedWords).values(data).returning().get();
  });

export const deleteLearnedWord = createServerFn({ method: "POST" })
  .inputValidator((data: number) => data)
  .handler(({ data }) => {
    db.delete(learnedWords).where(eq(learnedWords.id, data)).run();
  });

export const searchLearnedWords = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(({ data }) => {
    if (!data) {
      return db
        .select()
        .from(learnedWords)
        .orderBy(desc(learnedWords.createdAt))
        .all();
    }

    const pattern = `%${data}%`;
    return db
      .select()
      .from(learnedWords)
      .where(
        or(
          like(learnedWords.word, pattern),
          like(learnedWords.translation, pattern),
        ),
      )
      .orderBy(desc(learnedWords.createdAt))
      .all();
  });

export function learnedWordsQueryOptions() {
  return queryOptions({
    queryKey: ["learned-words"],
    queryFn: () => listLearnedWords({ data: {} }),
  });
}

export function searchLearnedWordsQueryOptions(query: string) {
  return queryOptions({
    queryKey: ["learned-words", query],
    queryFn: () => searchLearnedWords({ data: query }),
  });
}
