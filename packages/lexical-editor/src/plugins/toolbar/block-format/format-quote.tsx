import { $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection } from "lexical";

import { SelectItem } from "@workspace/ui/components/select";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { blockTypeToBlockName } from "./block-format-data";

const BLOCK_FORMAT_VALUE = "quote";

export function FormatQuote() {
  const { activeEditor, blockType } = useToolbarContext();
  const option = blockTypeToBlockName[BLOCK_FORMAT_VALUE];

  if (!option) {
    return null;
  }

  const formatQuote = () => {
    if (blockType !== "quote") {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
      activeEditor.focus();
    }
  };

  return (
    <SelectItem value="quote" onPointerDown={formatQuote}>
      <div className="flex items-center gap-1 font-normal">
        {option.icon}
        {option.label}
      </div>
    </SelectItem>
  );
}
