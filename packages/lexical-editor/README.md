# @workspace/lexical-editor

Reusable Lexical editor primitives shared across the workspace. The package ships two ready-to-use variants with standardized tooling (toolbar, slash commands, floating format bar, link editing, draggable blocks, autocomplete, etc.).

## Variants

- `InlineEditor`: Card-style editor with rounded borders and fullscreen toggle.
- `FullPageEditor`: Full-height editor for dedicated pages.

Both variants accept the same props:

- `editorState?: EditorState`
- `editorSerializedState?: SerializedEditorState<SerializedElementNode>`
- `onChange?: (editorState: EditorState) => void`
- `onSerializedChange?: (state: SerializedEditorState<SerializedElementNode>) => void`
- `namespace?: string`
- `className?: string`
- `autoCorrect?: { enabled: boolean; locale: "pt-BR"; persistOverrides?: boolean; storageKey?: string }`

## Usage

```tsx
import type { SerializedEditorState, SerializedElementNode } from "lexical";
import { InlineEditor, FullPageEditor } from "@workspace/lexical-editor";

function InlineExample({
  initialState,
  onSave,
}: {
  initialState?: SerializedEditorState<SerializedElementNode>;
  onSave: (state: SerializedEditorState<SerializedElementNode>) => void;
}) {
  return <InlineEditor editorSerializedState={initialState} onSerializedChange={onSave} />;
}

function FullPageExample({
  initialState,
  onSave,
}: {
  initialState?: SerializedEditorState<SerializedElementNode>;
  onSave: (state: SerializedEditorState<SerializedElementNode>) => void;
}) {
  return (
    <FullPageEditor
      editorSerializedState={initialState}
      onSerializedChange={onSave}
      autoCorrect={{ enabled: true, locale: "pt-BR", persistOverrides: true }}
    />
  );
}
```

## Notes

- Components import the bundled theme CSS automatically.
- `@workspace/ui` provides all UI primitives (buttons, select, tooltip, dialog, command palette).
- Lexical nodes and theme are exported via `@workspace/lexical-editor/themes` and `@workspace/lexical-editor/types` for consumers that need direct access.
- Auto-correct is intended for note-like pt-BR writing surfaces and is opt-in per editor instance.
