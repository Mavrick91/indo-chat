import { createServerFn } from "@tanstack/react-start";
import OpenAI from "openai";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export function validateMessages(messages: Message[]): void {
  if (messages.length === 0) {
    throw new Error("Messages array must not be empty");
  }

  if (messages.length > 200) {
    throw new Error("Messages array must not exceed 200 messages");
  }

  for (const message of messages) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime guard for untrusted input
    if (message.role !== "user" && message.role !== "assistant") {
      throw new Error(`Invalid message role: ${message.role}`);
    }

    if (message.content.length === 0) {
      throw new Error("Message content must not be empty");
    }

    if (message.content.length > 100_000) {
      throw new Error("Message content must not exceed 100,000 characters");
    }
  }
}

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: Message[] }) => {
    validateMessages(data.messages);
    return data;
  })
  .handler(async ({ data }) => {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: data.messages,
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(
            error instanceof Error ? error : new Error("Streaming failed"),
          );
        }
      },
      cancel() {
        stream.controller.abort();
      },
    });
  });
