import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection } from "lexical";

import { SelectItem } from "@workspace/ui/components/select";

import { useToolbarContext } from "@workspace/lexical-editor/context/toolbar-context";
import { blockTypeToBlockName } from "./block-format-data";

export function FormatHeading({ levels = [] }: { levels: HeadingTagType[] }) {
  const { activeEditor, blockType } = useToolbarContext();

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
    activeEditor.focus();
  };

  return levels.map((level) => {
    const option = blockTypeToBlockName[level];

    if (!option) {
      return null;
    }

    return (
      <SelectItem key={level} value={level} onPointerDown={() => formatHeading(level)}>
        <div className="flex items-center gap-1 font-normal">
          {option.icon}
          {option.label}
        </div>
      </SelectItem>
    );
  });
}
