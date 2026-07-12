"use client";

import { memo } from "react";
import { Streamdown } from "streamdown";

interface ChatStreamdownTextProps {
  className?: string;
  content: string;
  isStreaming?: boolean;
}

// The assistant-ui primitive in this installed version reads from assistant-ui
// message context, so this adapter keeps the same streamdown renderer controlled
// by our existing useAIChat message state.
export const ChatStreamdownText = memo(function ChatStreamdownText({
  className,
  content,
  isStreaming = false,
}: ChatStreamdownTextProps) {
  return (
    <Streamdown isAnimating={isStreaming} mode="streaming" {...(className ? { className } : {})}>
      {content}
    </Streamdown>
  );
});
