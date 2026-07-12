/* oxlint-disable */
import { describe, expect, it } from "vitest";

import {
  canReplayQueuedCorrection,
  getAutoCorrectPositionContext,
  shouldRegisterOverrideOnHistoricUpdate,
} from "@workspace/lexical-editor/plugins/auto-correct-plugin";

describe("auto-correct-plugin helpers", () => {
  it("detects paragraph-start context", () => {
    expect(getAutoCorrectPositionContext("")).toBe("paragraph-start");
    expect(getAutoCorrectPositionContext("   ")).toBe("paragraph-start");
  });

  it("detects sentence-start context", () => {
    expect(getAutoCorrectPositionContext("Paciente relatou melhora. ")).toBe("sentence-start");
    expect(getAutoCorrectPositionContext("Paciente relatou melhora? ")).toBe("sentence-start");
  });

  it("detects mid-sentence context", () => {
    expect(getAutoCorrectPositionContext("Paciente relatou ")).toBe("mid-sentence");
  });

  it("registers an override only for immediate undo without intervening mutation", () => {
    expect(
      shouldRegisterOverrideOnHistoricUpdate({
        hasInterveningMutation: false,
        undoRequested: true,
      }),
    ).toBe(true);

    expect(
      shouldRegisterOverrideOnHistoricUpdate({
        hasInterveningMutation: true,
        undoRequested: true,
      }),
    ).toBe(false);

    expect(
      shouldRegisterOverrideOnHistoricUpdate({
        hasInterveningMutation: false,
        undoRequested: false,
      }),
    ).toBe(false);
  });

  it("replays only the latest queued correction while cursor and node context still match", () => {
    const pendingAttempt = {
      anchorOffset: 4,
      boundaryText: " ",
      nodeKey: "node-1",
      positionContext: "paragraph-start" as const,
      rawToken: "Nao",
      textNodeStyle: "",
      tokenLength: 3,
      tokenStart: 0,
    };

    expect(
      canReplayQueuedCorrection({
        anchorOffset: 4,
        boundaryText: " ",
        currentSlice: "Nao ",
        nodeKey: "node-1",
        pendingAttempt,
        selectionNodeKey: "node-1",
      }),
    ).toBe(true);

    expect(
      canReplayQueuedCorrection({
        anchorOffset: 5,
        boundaryText: " ",
        currentSlice: "Nao  ",
        nodeKey: "node-1",
        pendingAttempt,
        selectionNodeKey: "node-1",
      }),
    ).toBe(false);
  });
});
