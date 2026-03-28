import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ChatView } from "~/components/ChatView";
import { NotFound } from "~/components/NotFound";
import { Sidebar } from "~/components/Sidebar";
import { conversationQueryOptions } from "~/utils/conversations";

export const Route = createFileRoute("/chat/$id")({
  loader: async ({ params: { id }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      conversationQueryOptions(id),
    );
    return { title: data.conversation.title };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : [],
  }),
  notFoundComponent: () => <NotFound>Conversation not found</NotFound>,
  component: ExistingChatPage,
});

function ExistingChatPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(conversationQueryOptions(id));
  const initialMessages = data.messages.map((m) => ({
    id: `db-${m.id}`,
    role: m.role,
    content: m.content,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <ChatView
        conversationId={data.conversation.id}
        initialMessages={initialMessages}
      />
    </div>
  );
}
