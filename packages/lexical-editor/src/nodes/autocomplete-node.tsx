import type {
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import type { JSX } from "react";

export type SerializedAutocompleteNode = Spread<
  {
    uuid: string;
  },
  SerializedLexicalNode
>;

interface AutocompleteDecorationData {
  fontSize: string;
  text: string;
}

const autocompleteSuggestionRegistry = new Map<string, AutocompleteDecorationData>();

function AutocompleteDecoration({ uuid }: { uuid: string }): JSX.Element | null {
  const suggestion = autocompleteSuggestionRegistry.get(uuid);
  if (!suggestion) {
    return null;
  }

  return (
    <span aria-hidden="true" style={{ fontSize: suggestion.fontSize, opacity: 0.45 }}>
      {suggestion.text}
    </span>
  );
}

export class AutocompleteNode extends DecoratorNode<JSX.Element | null> {
  /**
   * Session-local uuid keeps the node visible only for the editor instance
   * that created it, while the rendered text lives outside the serialized node.
   */
  __uuid: string;

  static clone(node: AutocompleteNode): AutocompleteNode {
    return new AutocompleteNode(node.__uuid, node.__key);
  }

  static getType(): "autocomplete" {
    return "autocomplete";
  }

  static importDOM() {
    return null;
  }

  static importJSON(serializedNode: SerializedAutocompleteNode): AutocompleteNode {
    return $createAutocompleteNode(serializedNode.uuid).updateFromJSON(serializedNode);
  }

  constructor(uuid: string, key?: NodeKey) {
    super(key);
    this.__uuid = uuid;
  }

  exportJSON(): SerializedAutocompleteNode {
    return {
      ...super.exportJSON(),
      type: "autocomplete",
      uuid: this.__uuid,
      version: 1,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("span");
    const className = config.theme.autocomplete;
    if (className) {
      dom.className = className;
    }
    dom.style.display = "inline";
    return dom;
  }

  // eslint-disable-next-line class-methods-use-this
  updateDOM(_prevNode: this, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element | null {
    return <AutocompleteDecoration uuid={this.__uuid} />;
  }

  // eslint-disable-next-line class-methods-use-this
  exportDOM(_: LexicalEditor): DOMExportOutput {
    return { element: null };
  }

  // eslint-disable-next-line class-methods-use-this
  excludeFromCopy() {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  isInline(): true {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  isKeyboardSelectable(): false {
    return false;
  }
}

export function $createAutocompleteNode(uuid: string): AutocompleteNode {
  return new AutocompleteNode(uuid);
}

export function $isAutocompleteNode(
  node: LexicalNode | null | undefined,
): node is AutocompleteNode {
  return node instanceof AutocompleteNode;
}

export function setAutocompleteSuggestion(
  uuid: string,
  suggestion: AutocompleteDecorationData,
): void {
  autocompleteSuggestionRegistry.set(uuid, suggestion);
}

export function clearAutocompleteSuggestion(uuid: string): void {
  autocompleteSuggestionRegistry.delete(uuid);
}
