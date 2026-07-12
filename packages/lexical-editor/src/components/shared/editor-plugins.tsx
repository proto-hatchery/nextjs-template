"use client";

import { useCallback, useMemo, useState } from "react";

import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import type { HeadingTagType } from "@lexical/rich-text";
import { Separator } from "@workspace/ui/components/separator";

// eslint-disable-next-line import/no-relative-parent-imports
import "../../themes/editor-theme.css";
import { ContentEditable } from "./content-editable";
import { AutoCorrectPlugin } from "@workspace/lexical-editor/plugins/auto-correct-plugin";
import { AutoLinkPlugin } from "@workspace/lexical-editor/plugins/auto-link-plugin";
import { AutocompletePlugin } from "@workspace/lexical-editor/plugins/autocomplete-plugin";
import { ComponentPickerMenuPlugin } from "@workspace/lexical-editor/plugins/component-picker-menu-plugin";
import { DraggableBlockPlugin } from "@workspace/lexical-editor/plugins/draggable-block-plugin";
import { FloatingLinkEditorPlugin } from "@workspace/lexical-editor/plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "@workspace/lexical-editor/plugins/floating-text-format-toolbar-plugin";
import { FullscreenPlugin } from "@workspace/lexical-editor/plugins/fullscreen-plugin";
import { LinkPlugin } from "@workspace/lexical-editor/plugins/link-plugin";
import { ListMaxIndentLevelPlugin } from "@workspace/lexical-editor/plugins/list-max-indent-level-plugin";
import { BulletedListPickerPlugin } from "@workspace/lexical-editor/plugins/picker/bulleted-list-picker-plugin";
import { CheckListPickerPlugin } from "@workspace/lexical-editor/plugins/picker/check-list-picker-plugin";
import { CodePickerPlugin } from "@workspace/lexical-editor/plugins/picker/code-picker-plugin";
import type { ComponentPickerOption } from "@workspace/lexical-editor/plugins/picker/component-picker-option";
import { DividerPickerPlugin } from "@workspace/lexical-editor/plugins/picker/divider-picker-plugin";
import { HeadingPickerPlugin } from "@workspace/lexical-editor/plugins/picker/heading-picker-plugin";
import { NumberedListPickerPlugin } from "@workspace/lexical-editor/plugins/picker/numbered-list-picker-plugin";
import { ParagraphPickerPlugin } from "@workspace/lexical-editor/plugins/picker/paragraph-picker-plugin";
import { QuotePickerPlugin } from "@workspace/lexical-editor/plugins/picker/quote-picker-plugin";
import { SlashCommandDecoratorPlugin } from "@workspace/lexical-editor/plugins/slash-command-decorator-plugin";
import { AlignmentToolbarPlugin } from "@workspace/lexical-editor/plugins/toolbar/alignment-toolbar-plugin";
import { FormatHeading } from "@workspace/lexical-editor/plugins/toolbar/block-format/format-heading";
import { FormatParagraph } from "@workspace/lexical-editor/plugins/toolbar/block-format/format-paragraph";
import { BlockFormatDropDown } from "@workspace/lexical-editor/plugins/toolbar/block-format-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@workspace/lexical-editor/plugins/toolbar/font-format-toolbar-plugin";
import { HistoryToolbarPlugin } from "@workspace/lexical-editor/plugins/toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "@workspace/lexical-editor/plugins/toolbar/link-toolbar-plugin";
import { ListToolbarPlugin } from "@workspace/lexical-editor/plugins/toolbar/list-toolbar-plugin";
import { ToolbarPlugin } from "@workspace/lexical-editor/plugins/toolbar/toolbar-plugin";
import type {
  EditorAutocompleteAcceptedEvent,
  EditorAutocompleteSource,
  LexicalEditorAutoCorrectOptions,
} from "@workspace/lexical-editor/types";

const HEADING_LEVELS: HeadingTagType[] = ["h1", "h2", "h3"];

const SLASH_MENU_OPTIONS = [
  ParagraphPickerPlugin(),
  HeadingPickerPlugin({ n: 1 }),
  HeadingPickerPlugin({ n: 2 }),
  HeadingPickerPlugin({ n: 3 }),
  QuotePickerPlugin(),
  DividerPickerPlugin(),
  BulletedListPickerPlugin(),
  NumberedListPickerPlugin(),
  CheckListPickerPlugin(),
  CodePickerPlugin(),
] satisfies Array<ComponentPickerOption>;

interface EditorPluginsAutocompleteProps {
  surfaceSessionId?: string | undefined;
  noteId?: string | undefined;
  locale?: "pt-BR" | undefined;
  enabled?: boolean | undefined;
  autoCorrect?: LexicalEditorAutoCorrectOptions | undefined;
  autocompleteSource?: EditorAutocompleteSource | undefined;
  onAutocompleteAccepted?: ((event: EditorAutocompleteAcceptedEvent) => void) | undefined;
}

export function InlineEditorPlugins({
  surfaceSessionId,
  noteId,
  locale,
  enabled,
  autoCorrect,
  autocompleteSource,
  onAutocompleteAccepted,
}: EditorPluginsAutocompleteProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const handleAnchorRef = useCallback((element: HTMLDivElement | null) => {
    setFloatingAnchorElem(element);
  }, []);

  const slashMenuOptions = useMemo(() => SLASH_MENU_OPTIONS, []);

  return (
    <div className="flex flex-col h-full min-w-0 max-w-full overflow-hidden">
      <ToolbarPlugin>
        {() => (
          <div
            role="toolbar"
            aria-label="Editor toolbar"
            className="notion-editor-toolbar flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-hide border-b border-border/40 bg-background px-2 py-1.5 sm:px-3 sm:py-2 text-sm backdrop-blur-sm max-w-full"
          >
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-2 min-w-max">
              <div className="shrink-0">
                <HistoryToolbarPlugin />
              </div>
              <div className="mx-1 flex h-6 items-center shrink-0">
                <Separator orientation="vertical" />
              </div>

              <div className="shrink-0">
                <BlockFormatDropDown>
                  <FormatParagraph />
                  <FormatHeading levels={HEADING_LEVELS} />
                </BlockFormatDropDown>
              </div>
              <div className="shrink-0">
                <ListToolbarPlugin />
              </div>
              <div className="mx-1 flex h-6 items-center shrink-0">
                <Separator orientation="vertical" />
              </div>

              <div className="shrink-0">
                <FontFormatToolbarPlugin />
              </div>
              <div className="shrink-0">
                <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
              </div>
              <div className="mx-1 flex h-6 items-center shrink-0">
                <Separator orientation="vertical" />
              </div>

              <div className="shrink-0 pr-6 sm:pr-0">
                <AlignmentToolbarPlugin />
              </div>
            </div>
          </div>
        )}
      </ToolbarPlugin>

      <div className="relative flex-1 min-h-0 min-w-0 max-w-full overflow-hidden">
        <RichTextPlugin
          contentEditable={
            <div className="relative px-4 py-4 sm:px-8 h-full w-full max-w-full overflow-auto">
              <div
                ref={handleAnchorRef}
                className="relative min-h-[600px] h-full w-full max-w-full"
              >
                <ContentEditable
                  placeholder="Escreva algo incrível... ou digite / para abrir o menu de blocos"
                  className="relative block min-h-[580px] h-full w-full whitespace-pre-wrap break-words px-0 py-3 text-base leading-7 focus:outline-none sm:px-6 max-w-full"
                  placeholderClassName="text-muted-foreground pointer-events-none absolute top-3 left-0 overflow-hidden px-4 text-base leading-7 text-ellipsis select-none sm:top-3 sm:px-6"
                  spellCheck={autoCorrect?.enabled ? false : undefined}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={5} />
        <TabIndentationPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        <AutoCorrectPlugin
          enabled={autoCorrect?.enabled === true}
          locale={autoCorrect?.locale}
          persistOverrides={autoCorrect?.persistOverrides}
          storageKey={autoCorrect?.storageKey}
        />
        <AutocompletePlugin
          surfaceSessionId={surfaceSessionId}
          noteId={noteId}
          locale={locale}
          enabled={enabled}
          autocompleteSource={autocompleteSource}
          onAutocompleteAccepted={onAutocompleteAccepted}
        />
        <SlashCommandDecoratorPlugin />
        <ComponentPickerMenuPlugin baseOptions={slashMenuOptions} />

        {floatingAnchorElem ? (
          <>
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
          </>
        ) : null}

        <FullscreenPlugin />
      </div>
    </div>
  );
}

export function FullPageEditorPlugins({
  surfaceSessionId,
  noteId,
  locale,
  enabled,
  autoCorrect,
  autocompleteSource,
  onAutocompleteAccepted,
}: EditorPluginsAutocompleteProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const handleAnchorRef = useCallback((element: HTMLDivElement | null) => {
    if (element !== null) {
      setFloatingAnchorElem(element);
    }
  }, []);

  const slashMenuOptions = useMemo(() => SLASH_MENU_OPTIONS, []);

  return (
    <div className="relative flex h-full flex-col min-w-0 max-w-full overflow-hidden">
      <ToolbarPlugin>
        {() => (
          <div
            role="toolbar"
            aria-label="Editor toolbar"
            className="notion-editor-toolbar sticky top-0 z-50 flex items-center justify-start sm:justify-center overflow-x-auto scrollbar-hide border-b border-border/40 bg-background px-2 py-1.5 sm:px-3 sm:py-2 text-sm backdrop-blur-md max-w-full"
          >
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-2 min-w-max">
              <div className="shrink-0">
                <HistoryToolbarPlugin />
              </div>
              <div className="mx-1 flex h-6 items-center shrink-0">
                <Separator orientation="vertical" />
              </div>

              <div className="shrink-0">
                <BlockFormatDropDown>
                  <FormatParagraph />
                  <FormatHeading levels={HEADING_LEVELS} />
                </BlockFormatDropDown>
              </div>
              <div className="shrink-0">
                <ListToolbarPlugin />
              </div>
              <div className="mx-1 flex h-6 items-center shrink-0">
                <Separator orientation="vertical" />
              </div>

              <div className="shrink-0">
                <FontFormatToolbarPlugin />
              </div>
              <div className="shrink-0">
                <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
              </div>
              <div className="mx-1 flex h-6 items-center shrink-0">
                <Separator orientation="vertical" />
              </div>

              <div className="shrink-0 pr-6 sm:pr-0">
                <AlignmentToolbarPlugin />
              </div>
            </div>
          </div>
        )}
      </ToolbarPlugin>

      <div className="relative flex-1 overflow-auto bg-background min-w-0 max-w-full">
        <RichTextPlugin
          contentEditable={
            <div className="relative mx-auto max-w-4xl w-full px-4 sm:px-8 overflow-hidden">
              <div ref={handleAnchorRef} className="relative min-h-full w-full max-w-full">
                <ContentEditable
                  placeholder="Escreva algo incrível... ou digite / para abrir o menu de blocos"
                  className="block min-h-[400px] w-full whitespace-pre-wrap break-words px-0 py-8 text-base leading-7 focus:outline-none sm:px-6 sm:py-12 max-w-full"
                  placeholderClassName="text-muted-foreground pointer-events-none absolute top-8 left-0 overflow-hidden px-4 text-base leading-7 text-ellipsis select-none sm:top-12 sm:px-6"
                  spellCheck={autoCorrect?.enabled ? false : undefined}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={5} />
        <TabIndentationPlugin />
        <AutoLinkPlugin />
        <LinkPlugin />
        <AutoCorrectPlugin
          enabled={autoCorrect?.enabled === true}
          locale={autoCorrect?.locale}
          persistOverrides={autoCorrect?.persistOverrides}
          storageKey={autoCorrect?.storageKey}
        />
        <AutocompletePlugin
          surfaceSessionId={surfaceSessionId}
          noteId={noteId}
          locale={locale}
          enabled={enabled}
          autocompleteSource={autocompleteSource}
          onAutocompleteAccepted={onAutocompleteAccepted}
        />
        <SlashCommandDecoratorPlugin />
        <ComponentPickerMenuPlugin baseOptions={slashMenuOptions} />

        {floatingAnchorElem ? (
          <>
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
          </>
        ) : null}
      </div>
    </div>
  );
}
