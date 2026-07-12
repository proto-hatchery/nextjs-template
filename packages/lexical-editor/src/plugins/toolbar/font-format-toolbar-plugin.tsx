"use client";

import { $isTableSelection } from "@lexical/table";
import {
  $isRangeSelection,
  type BaseSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
} from "lexical";
import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { BrandButton } from "@workspace/brand/components/brand-button";
import { Separator } from "@workspace/ui/components/separator";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@workspace/lexical-editor/editor-hooks/use-update-toolbar";

const FORMATS = [
  { format: "bold", icon: BoldIcon, label: "Bold" },
  { format: "italic", icon: ItalicIcon, label: "Italic" },
  { format: "underline", icon: UnderlineIcon, label: "Underline" },
  { format: "strikethrough", icon: StrikethroughIcon, label: "Strikethrough" },
] as const;

export function FontFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const $updateToolbar = useCallback((selection: BaseSelection) => {
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const formats: string[] = [];
      FORMATS.forEach(({ format }) => {
        if (selection.hasFormat(format as TextFormatType)) {
          formats.push(format);
        }
      });
      setActiveFormats((prev) => {
        // Only update if formats have changed
        if (prev.length !== formats.length || !formats.every((f) => prev.includes(f))) {
          return formats;
        }
        return prev;
      });
    }
  }, []);

  useUpdateToolbarHandler($updateToolbar);

  return (
    <div className="flex items-center gap-0">
      {FORMATS.map(({ format, icon: Icon, label }, index) => (
        <div key={format} className="flex items-center">
          <BrandButton
            family="default"
            variant={activeFormats.includes(format) ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 px-0"
            aria-label={label}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format as TextFormatType);
            }}
          >
            <Icon className="size-4" />
          </BrandButton>
          {index < FORMATS.length - 1 && <Separator orientation="vertical" className="h-6 mx-0" />}
        </div>
      ))}
    </div>
  );
}
