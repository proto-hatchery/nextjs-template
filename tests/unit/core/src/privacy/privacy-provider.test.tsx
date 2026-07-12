/* oxlint-disable */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  delete document.documentElement.dataset.privacyMode;
});

import { PrivacyModeProvider, usePrivacyMode } from "@workspace/core/privacy/privacy-provider";

function TestConsumer() {
  const { isVisible, toggle, setVisible, isPending } = usePrivacyMode();
  return (
    <div>
      <span data-testid="visible">{String(isVisible)}</span>
      <span data-testid="pending">{String(isPending)}</span>
      <button data-testid="toggle" onClick={toggle}>
        Toggle
      </button>
      <button data-testid="hide" onClick={() => setVisible(false)}>
        Hide
      </button>
    </div>
  );
}

describe("PrivacyModeProvider", () => {
  it("provides default visible state", () => {
    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    expect(screen.getByTestId("visible").textContent).toBe("true");
  });

  it("toggles visibility", () => {
    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("visible").textContent).toBe("false");

    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByTestId("visible").textContent).toBe("true");
  });

  it("sets visibility explicitly", () => {
    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    fireEvent.click(screen.getByTestId("hide"));
    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("sets data-privacy-mode on document element", async () => {
    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    await waitFor(() =>
      expect(document.documentElement.dataset.privacyMode).toBe("visible")
    );

    fireEvent.click(screen.getByTestId("toggle"));
    await waitFor(() =>
      expect(document.documentElement.dataset.privacyMode).toBe("hidden")
    );
  });

  it("reads from localStorage on mount", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue("false"),
      setItem: vi.fn(),
    });

    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("persists to localStorage on toggle", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(null),
      setItem,
    });

    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    fireEvent.click(screen.getByTestId("toggle"));
    expect(setItem).toHaveBeenCalledWith("privacy-mode-visible", "false");
  });

  it("throws when usePrivacyMode is used outside provider", () => {
    const ConsoleError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestConsumer />)).toThrow(
      "usePrivacyMode must be used within PrivacyModeProvider"
    );

    console.error = ConsoleError;
  });

  it("toggles on keyboard shortcut Ctrl+Shift+H", () => {
    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    const event = new KeyboardEvent("keydown", {
      ctrlKey: true,
      shiftKey: true,
      key: "h",
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("toggles on keyboard shortcut Meta+Shift+H", () => {
    render(
      <PrivacyModeProvider>
        <TestConsumer />
      </PrivacyModeProvider>
    );

    const event = new KeyboardEvent("keydown", {
      metaKey: true,
      shiftKey: true,
      key: "H",
      bubbles: true,
    });
    document.dispatchEvent(event);

    expect(screen.getByTestId("visible").textContent).toBe("false");
  });
});
