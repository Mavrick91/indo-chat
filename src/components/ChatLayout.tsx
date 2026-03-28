import { useState } from "react";

import { Sidebar } from "~/components/Sidebar";
import { VocabularySidebar } from "~/components/VocabularySidebar";
import { LearnedWordsProvider } from "~/contexts/LearnedWordsContext";

import { ChatView, type ChatViewProps } from "./ChatView";

export function ChatLayout(props: ChatViewProps) {
  const [isVocabOpen, setIsVocabOpen] = useState(false);

  return (
    <LearnedWordsProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <ChatView {...props} onToggleVocab={() => setIsVocabOpen(true)} />
        <VocabularySidebar
          isMobileOpen={isVocabOpen}
          onMobileClose={() => setIsVocabOpen(false)}
        />
      </div>
    </LearnedWordsProvider>
  );
}
