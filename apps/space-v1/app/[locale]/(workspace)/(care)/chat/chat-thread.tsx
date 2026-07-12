"use client";

import type { UseAIChatReturn } from "@workspace/supabase-data/hooks/ai";
import { Button } from "@workspace/ui/components/button";
import { ArrowUp, Check, Copy, Pencil, RotateCcw, Square } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type ChatThreadProps = UseAIChatReturn & {
  stop?: (() => void) | undefined;
};

export function ChatThread({ messages, status, error, sendMessage, stop }: ChatThreadProps) {
  const [inputValue, setInputValue] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, autoScroll]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
  };

  const submitCurrentInput = async () => {
    if (!inputValue.trim() || status === "submitting") {
      return;
    }

    const contentToSend = inputValue;
    setInputValue("");

    try {
      await sendMessage(contentToSend);
    } catch {
      setInputValue((previousValue) => (previousValue === "" ? contentToSend : previousValue));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submitCurrentInput();
  };

  const isBusy = status === "submitting";
  const lastMessage = messages[messages.length - 1];
  const isWaitingForAssistant = isBusy && (!lastMessage || lastMessage.role === "user");

  return (
    <div className="flex h-full flex-col bg-background selection:bg-muted selection:text-foreground">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-grow flex-col gap-8 overflow-y-auto px-4 pt-12 md:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {messages.length === 0 && !isBusy ? (
          <div className="flex flex-grow flex-col items-center justify-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Por onde começamos?
            </h1>
          </div>
        ) : null}

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-8">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id ?? `${message.role}-${index}`}
              message={message}
              isLast={index === messages.length - 1 && !isWaitingForAssistant}
            />
          ))}

          {isWaitingForAssistant ? <AssistantThinkingIndicator /> : null}
        </div>
      </div>

      {error ? (
        <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error.message}
          </div>
        </div>
      ) : null}

      <div className="bg-background px-4 pb-6 pt-2 md:px-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 overflow-hidden rounded-[24px] border border-border/40 bg-muted/30 py-1 pl-4 pr-1.5 transition-all duration-500 ease-out focus-within:bg-background"
        >
          <div className="relative flex-grow py-2">
            <textarea
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitCurrentInput();
                }
              }}
              placeholder="Pergunte alguma coisa..."
              className="relative z-10 flex w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
              rows={1}
              style={{ fieldSizing: "content", maxHeight: "200px" }}
            />
          </div>

          <div className="mb-1 shrink-0">
            {isBusy ? (
              <Button
                type="button"
                size="icon"
                className="h-8 w-8 rounded-full bg-foreground text-background transition-transform hover:bg-foreground/90 active:scale-95"
                onClick={() => stop?.()}
                aria-label="Parar"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="h-8 w-8 rounded-full bg-foreground text-background transition-all duration-200 hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 active:scale-95"
                aria-label="Enviar"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground/80">
          AI pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
}

function AssistantThinkingIndicator() {
  return (
    <div className="flex w-full animate-in fade-in duration-300">
      <div className="flex h-8 min-w-0 flex-1 flex-col justify-center gap-2 pt-2">
        <div
          className="flex items-center gap-1 text-foreground"
          aria-label="Pensando..."
          aria-live="polite"
        >
          <span className="h-3 w-3 animate-pulse rounded-full bg-foreground" />
        </div>
      </div>
    </div>
  );
}

function MessageItem({
  message,
  isLast,
}: {
  message: UseAIChatReturn["messages"][number];
  isLast: boolean;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  if (isUser) {
    return (
      <div className="group relative flex w-full flex-col items-end gap-2">
        <div className="flex max-w-[85%] items-start gap-4 sm:max-w-[75%]">
          {!isLast ? (
            <div className="mt-2 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="rounded-[24px] bg-muted px-5 py-2.5 text-foreground">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex w-full animate-in fade-in duration-300">
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
        <div className="text-foreground">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        </div>

        <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:text-muted-foreground/60 sm:opacity-100">
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
            title="Copiar"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>

          {isLast ? (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
              title="Regenerar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
