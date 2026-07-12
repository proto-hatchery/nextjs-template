"use client";

import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import { ActionError } from "../lib/boundary/action-error";

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const ChatOutboundResponseSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid(),
  role: z.literal("assistant"),
  content: z.string(),
  createdAt: z.string().datetime(),
  latencyMs: z.number().int().nonnegative(),
  traceId: z.string(),
});

const ChatErrorResponseSchema = z.object({
  error: z.object({
    type: z.string(),
    message: z.string(),
  }),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatStatus = "idle" | "submitting" | "success" | "error";

export interface UseAIChatOptions {
  conversationId?: string | null;
  patientId?: string;
  sessionId?: string;
  workspaceContext?: "general" | "patient" | "session" | "marketing" | "admin" | "financial" | "calendar";
  retrievalMode?:
    | "off"
    | "auto"
    | "basic"
    | "patient-notes"
    | "documents"
    | "clinical-full"
    | "financial"
    | "calendar"
    | "comprehensive"
    | "session-prep";
  featureIntent?:
    | "general_chat"
    | "clinical_assistant"
    | "session_prep"
    | "message_drafting"
    | "marketing";
  onError?: (error: ActionError) => void;
  onFinish?: (message: ChatMessage) => void;
}

export interface UseAIChatReturn {
  messages: ChatMessage[];
  status: ChatStatus;
  error: ActionError | null;
  sendMessage: (content: string) => Promise<void>;
  conversationId: string | null;
}

function parseErrorResponse(errorText: string): { code: string; message: string } {
  if (!errorText) return { code: "UNKNOWN_ERROR", message: "An unknown error occurred" };

  try {
    const parsed = ChatErrorResponseSchema.safeParse(JSON.parse(errorText));
    if (parsed.success) {
      return {
        code: parsed.data.error.type.toUpperCase(),
        message: parsed.data.error.message,
      };
    }
  } catch {
    // Fall through to default.
  }

  return { code: "HTTP_ERROR", message: errorText.slice(0, 200) };
}

function toActionError(error: unknown): ActionError {
  if (error instanceof ActionError) return error;
  if (error instanceof Error) {
    return new ActionError({
      code: "AI_CHAT_ERROR",
      message: error.message,
      isRetryable: true,
    });
  }
  return new ActionError({
    code: "AI_CHAT_ERROR",
    message: "Erro ao enviar mensagem.",
    isRetryable: true,
  });
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const {
    conversationId: initialConversationId,
    patientId,
    sessionId,
    workspaceContext = "general",
    retrievalMode = "auto",
    featureIntent = "general_chat",
    onError,
    onFinish,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<ActionError | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationIdRef = useRef<string | null>(initialConversationId ?? null);

  const updateMessages = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      const requestId = crypto.randomUUID();
      const userMessage: ChatMessage = {
        id: `${requestId}-user`,
        role: "user",
        content: trimmedContent,
      };
      const requestMessages = [...messagesRef.current, userMessage];

      setError(null);
      setStatus("submitting");
      updateMessages(requestMessages);

      try {
        const supabase = createBrowserAuthClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          throw new ActionError({
            code: "AUTH_REQUIRED",
            message: "Not authenticated",
            isRetryable: false,
          });
        }

        const { data, error: functionError } = await supabase.functions.invoke<
          z.infer<typeof ChatOutboundResponseSchema>
        >("ai-chat-foundry", {
          body: {
            conversationId: conversationIdRef.current ?? undefined,
            message: trimmedContent,
            patientId,
            sessionId,
            workspaceContext,
            retrievalMode,
            featureIntent,
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (functionError) {
          const parsed = parseErrorResponse(functionError.message);
          throw new ActionError({
            code: parsed.code,
            message: parsed.message,
            isRetryable: true,
          });
        }

        const parsed = ChatOutboundResponseSchema.parse(data);
        const assistantMessage: ChatMessage = {
          id: parsed.messageId,
          role: "assistant",
          content: parsed.content,
        };
        conversationIdRef.current = parsed.conversationId;
        setConversationId(parsed.conversationId);
        updateMessages([...requestMessages, assistantMessage]);
        setStatus("success");
        onFinish?.(assistantMessage);
      } catch (caught) {
        const actionError = toActionError(caught);
        setError(actionError);
        setStatus("error");
        onError?.(actionError);
        throw actionError;
      }
    },
    [featureIntent, onError, onFinish, patientId, retrievalMode, sessionId, updateMessages, workspaceContext],
  );

  return { messages, status, error, sendMessage, conversationId };
}
