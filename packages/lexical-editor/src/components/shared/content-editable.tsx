"use client";

import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import type { JSX } from "react";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
  spellCheck?: boolean | undefined;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
  spellCheck,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none`
      }
      spellCheck={spellCheck}
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden px-4 text-base leading-7 text-ellipsis select-none`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
