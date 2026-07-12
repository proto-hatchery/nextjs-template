import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode, $getSelection, $isRangeSelection } from "lexical";

import { SelectItem } from "@workspace/ui/components/select";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { blockTypeToBlockName } from "./block-format-data";

const BLOCK_FORMAT_VALUE = "paragraph";

export function FormatParagraph() {
  const { activeEditor } = useToolbarContext();
  const option = blockTypeToBlockName[BLOCK_FORMAT_VALUE];

  if (!option) {
    return null;
  }

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
    activeEditor.focus();
  };

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onPointerDown={formatParagraph}>
      <div className="flex items-center gap-1 font-normal">
        {option.icon}
        {option.label}
      </div>
    </SelectItem>
  );
}
