import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { ChatThread } from "./chat-thread";

describe("ChatThread", () => {
  it("submits the current message with Enter", () => {
    const sendMessageMock = vi.fn();

    render(
      <ChatThread
        messages={[]}
        status="idle"
        error={null}
        conversationId={null}
        sendMessage={sendMessageMock}
        stop={vi.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText("Pergunte alguma coisa...");
    fireEvent.change(textarea, { target: { value: "Olá" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(sendMessageMock).toHaveBeenCalledWith("Olá");
  });

  it("does not render chat autocomplete affordances", () => {
    render(
      <ChatThread
        messages={[]}
        status="idle"
        error={null}
        conversationId={null}
        sendMessage={vi.fn()}
        stop={vi.fn()}
      />,
    );

    expect(screen.queryByText("Tab para completar")).toBeNull();
    expect(screen.queryByRole("button", { name: "Aceitar" })).toBeNull();
  });
});
