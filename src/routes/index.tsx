import { createFileRoute, useRouter } from "@tanstack/react-router";

import { ChatView } from "~/components/ChatView";
import { Sidebar } from "~/components/Sidebar";

export const Route = createFileRoute("/")({
  component: NewChat,
});

function NewChat() {
  const router = useRouter();

  const handleConversationCreated = (id: number) => {
    void router.navigate({
      to: "/chat/$id",
      params: { id: String(id) },
      replace: true,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <ChatView
        conversationId={null}
        initialMessages={[]}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
