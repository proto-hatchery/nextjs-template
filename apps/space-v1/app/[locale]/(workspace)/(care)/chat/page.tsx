"use client";

import { useAIChat } from "@workspace/supabase-data/hooks/ai";

import { ChatThread } from "./chat-thread";

// Main page component
export default function ChatPage() {
  const chat = useAIChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onFinish: (message) => {
      console.log("Message completed:", message);
    },
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <ChatThread {...chat} />
    </div>
  );
}
