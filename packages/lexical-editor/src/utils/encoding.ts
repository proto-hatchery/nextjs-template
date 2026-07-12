import type { SerializedEditorState, SerializedElementNode, SerializedLexicalNode } from "lexical";

function isSerializedEditorState(
  value: unknown,
): value is SerializedEditorState<SerializedElementNode> {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (!record.root || typeof record.root !== "object") return false;
  const root = record.root as Record<string, unknown>;
  return root.type === "root" && Array.isArray(root.children);
}

function normalizeSerializedEditorState(
  value: unknown,
): SerializedEditorState<SerializedElementNode> | null {
  if (isSerializedEditorState(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const content = record.content;
  if (content && typeof content === "object" && isSerializedEditorState(content)) {
    return content;
  }

  return null;
}

/**
 * Encodes a Lexical editor state to a Base64 string for storage.
 * Works in both browser and Node.js environments.
 * Supports UTF-8 characters (e.g., Portuguese accents).
 */
export function encodeNote(state: SerializedEditorState<SerializedElementNode>): string {
  const jsonString = JSON.stringify(state);
  if (typeof window === "undefined") {
    return Buffer.from(jsonString, "utf-8").toString("base64");
  }
  // Use TextEncoder to properly handle UTF-8 characters
  const encoder = new TextEncoder();
  const bytes = encoder.encode(jsonString);
  // Convert bytes to binary string for btoa (handles large arrays)
  let binaryString = "";
  const chunkSize = 8192; // Process in chunks to avoid stack overflow
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }
  return window.btoa(binaryString);
}

/**
 * Decodes a Base64 string back to a Lexical editor state.
 * Works in both browser and Node.js environments.
 */
export function decodeNote(base64String: string): SerializedEditorState<SerializedElementNode> {
  const rawInput = base64String.trim();
  const normalizedBase64 = rawInput.replace(/-/g, "+").replace(/_/g, "/");

  const parseJsonState = (
    jsonValue: string,
  ): SerializedEditorState<SerializedElementNode> | null => {
    const parsed = JSON.parse(jsonValue) as unknown;

    // Some legacy entries may be JSON-stringified twice.
    if (typeof parsed === "string") {
      return parseJsonState(parsed);
    }

    return normalizeSerializedEditorState(parsed);
  };

  const decodeBase64ToJson = (): string => {
    if (typeof window === "undefined") {
      return Buffer.from(normalizedBase64, "base64").toString("utf-8");
    }

    const binaryString = window.atob(normalizedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  };

  try {
    const jsonString = decodeBase64ToJson();
    const normalizedState = parseJsonState(jsonString);
    if (normalizedState) {
      return normalizedState;
    }
  } catch {
    // Fallback below: some legacy rows may have raw JSON instead of Base64.
  }

  // Legacy fallback: value may be raw JSON in DB, not base64 encoded.
  try {
    const normalizedState = parseJsonState(rawInput);
    if (normalizedState) {
      return normalizedState;
    }
  } catch {
    // Ignore and throw generic error below.
  }

  throw new Error("Invalid encoded note format");
}

/**
 * Creates an empty Lexical editor state structure.
 * Useful for initializing new notes.
 */
export function createEmptyEditorState(): SerializedEditorState<SerializedElementNode> {
  return {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

function stripAutocompleteFromNode(node: SerializedLexicalNode): SerializedLexicalNode | null {
  if ("type" in node && node.type === "autocomplete") {
    return null;
  }

  if ("children" in node && Array.isArray(node.children)) {
    const stripped = {
      ...node,
      children: node.children
        .map((child) => stripAutocompleteFromNode(child))
        .filter((child): child is SerializedLexicalNode => child !== null),
    };
    return stripped as SerializedLexicalNode;
  }

  return node;
}

export function sanitizeSerializedEditorState(
  state: SerializedEditorState<SerializedElementNode>,
): SerializedEditorState<SerializedElementNode> {
  const sanitizedRoot = stripAutocompleteFromNode(state.root) as SerializedElementNode | null;

  return {
    ...state,
    root: (sanitizedRoot ?? createEmptyEditorState().root) as typeof state.root,
  };
}

/**
 * Extracts plain text from a Lexical editor state.
 * Useful for feeding content to AI or searching.
 */
function extractFromNode(node: SerializedLexicalNode): string {
  if ("text" in node && typeof node.text === "string") {
    return node.text;
  }
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(extractFromNode).join(" ");
  }
  return "";
}

export function extractTextFromEditorState(
  state: SerializedEditorState<SerializedElementNode>,
): string {
  const sanitizedState = sanitizeSerializedEditorState(state);

  return extractFromNode(sanitizedState.root)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
