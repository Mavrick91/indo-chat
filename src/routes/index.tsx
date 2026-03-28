import { createFileRoute, useRouter } from "@tanstack/react-router";

import { ChatLayout } from "~/components/ChatLayout";

export const Route = createFileRoute("/")({
  component: NewChat,
});

function NewChat() {
  const router = useRouter();

  function handleConversationCreated(id: number) {
    void router.navigate({
      to: "/chat/$id",
      params: { id: String(id) },
      replace: true,
    });
  }

  return (
    <ChatLayout
      conversationId={null}
      initialMessages={[]}
      onConversationCreated={handleConversationCreated}
    />
  );
}
