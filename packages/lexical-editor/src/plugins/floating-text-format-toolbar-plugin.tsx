"use client";

import { computePosition, flip, offset, shift } from "@floating-ui/react";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type TextFormatType,
} from "lexical";
import { BoldIcon, ItalicIcon, LinkIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import {
  type ComponentType,
  type Dispatch,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { cn } from "@workspace/ui/lib/utils";

import { getSelectedNode } from "@workspace/lexical-editor/utils/get-selected-node";
import { sanitizeUrl } from "@workspace/lexical-editor/utils/url";

type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  isLink: boolean;
};

const DEFAULT_STATE: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  isLink: false,
};

const FORMAT_CONTROLS: Array<{
  key: keyof FormatState;
  format: TextFormatType;
  icon: ComponentType<{ className?: string }>;
  label: string;
}> = [
  { key: "bold", format: "bold", icon: BoldIcon, label: "Bold" },
  { key: "italic", format: "italic", icon: ItalicIcon, label: "Italic" },
  { key: "underline", format: "underline", icon: UnderlineIcon, label: "Underline" },
  {
    key: "strikethrough",
    format: "strikethrough",
    icon: StrikethroughIcon,
    label: "Strikethrough",
  },
];

// Helper function to get DOMRect from selection range - Lexical Playground pattern
function getDOMRangeRect(nativeSelection: Selection, rootElement: HTMLElement): DOMRect | null {
  const domRange = nativeSelection.getRangeAt(0);

  if (!domRange || !rootElement.contains(domRange.commonAncestorContainer)) {
    return null;
  }

  let rect = domRange.getBoundingClientRect();

  // Handle collapsed selection or empty rect
  if (rect.width === 0 && rect.height === 0) {
    // Try to get rect from the first element
    if (domRange.startContainer.nodeType === Node.TEXT_NODE) {
      const span = document.createElement("span");
      domRange.insertNode(span);
      rect = span.getBoundingClientRect();
      const parent = span.parentNode;
      if (parent) {
        parent.removeChild(span);
        parent.normalize();
      }
    }
  }

  return rect;
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLDivElement | null;
  setIsLinkEditMode: Dispatch<boolean>;
}): ReactNode {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [formats, setFormats] = useState<FormatState>(() => ({
    ...DEFAULT_STATE,
  }));
  const [isVisible, setIsVisible] = useState(false);

  const updateToolbarPosition = useCallback(async () => {
    const toolbar = toolbarRef.current;
    const rootElement = editor.getRootElement();

    if (!toolbar || !anchorElem || !rootElement) return;

    const nativeSelection = window.getSelection();

    if (!nativeSelection || nativeSelection.rangeCount === 0) {
      setIsVisible(false);
      return;
    }

    const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

    if (!rangeRect) {
      setIsVisible(false);
      return;
    }

    // Create a virtual element for floating-ui positioning
    const virtualElement = {
      getBoundingClientRect: () => rangeRect,
    };

    // Use floating-ui to calculate optimal position
    const { x, y } = await computePosition(virtualElement, toolbar, {
      placement: "top",
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ["bottom", "top"],
        }),
        shift({ padding: 8 }),
      ],
    });

    toolbar.style.left = `${x}px`;
    toolbar.style.top = `${y}px`;
    toolbar.style.opacity = "1";
    setIsVisible(true);
  }, [anchorElem, editor]);

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      // Hide toolbar if no valid selection
      if (
        !anchorElem ||
        !$isRangeSelection(selection) ||
        selection.isCollapsed() ||
        selection.getTextContent().trim() === ""
      ) {
        setFormats({ ...DEFAULT_STATE });
        setIsVisible(false);
        return;
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      // Update format state
      setFormats({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
        isLink: $isLinkNode(node) || $isLinkNode(parent),
      });

      // Update position
      void updateToolbarPosition();
    });
  }, [anchorElem, editor, updateToolbarPosition]);

  useEffect(() => {
    if (!anchorElem) return;

    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateToolbar();
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [anchorElem, editor, updateToolbar]);

  useEffect(() => {
    if (!anchorElem) return;

    const handleReposition = () => {
      if (isVisible) {
        void updateToolbarPosition();
      }
    };

    window.addEventListener("resize", handleReposition);
    document.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      document.removeEventListener("scroll", handleReposition, true);
    };
  }, [anchorElem, isVisible, updateToolbarPosition]);

  const applyFormat = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const toggleLink = useCallback(() => {
    if (formats.isLink) {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    setIsLinkEditMode(true);
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
  }, [editor, formats.isLink, setIsLinkEditMode]);

  const toolbar = (
    <div
      ref={toolbarRef}
      className="pointer-events-auto fixed z-50 flex items-center gap-1 rounded-full border border-border bg-popover/95 px-2 py-1 text-sm text-foreground shadow-lg backdrop-blur-sm transition-opacity duration-150"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        visibility: isVisible ? "visible" : "hidden",
      }}
    >
      {FORMAT_CONTROLS.map(({ key, format, icon: Icon, label }) => (
        <BrandButton
          family="default"
          key={key}
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            applyFormat(format);
          }}
          className={cn(
            "size-8 rounded-full border border-transparent bg-transparent text-muted-foreground",
            formats[key] && "border-border bg-accent/70 text-foreground",
          )}
          aria-pressed={formats[key]}
          aria-label={label}
        >
          <Icon className="size-4" />
        </BrandButton>
      ))}
      <BrandButton
        family="default"
        type="button"
        variant="ghost"
        size="icon"
        onMouseDown={(event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          toggleLink();
        }}
        className={cn(
          "size-8 rounded-full border border-transparent bg-transparent text-muted-foreground",
          formats.isLink && "border-border bg-accent/70 text-foreground",
        )}
        aria-pressed={formats.isLink}
        aria-label="Toggle link"
      >
        <LinkIcon className="size-4" />
      </BrandButton>
    </div>
  );

  if (!anchorElem) {
    return null;
  }

  return createPortal(toolbar, anchorElem);
}
