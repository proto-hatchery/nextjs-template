import type React from "react";

export const shouldPreventDateKeyDown = (
  event: Pick<React.KeyboardEvent<HTMLInputElement>, "altKey" | "ctrlKey" | "key" | "metaKey">,
): boolean => {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return false;
  }

  if (event.key.length !== 1) {
    return false;
  }

  return !/[0-9/]/.test(event.key);
};

export const shouldPreventDateBeforeInput = (
  nativeEvent: Pick<InputEvent, "data" | "inputType" | "isComposing">,
): boolean => {
  if (
    nativeEvent.isComposing ||
    nativeEvent.inputType?.startsWith("delete") ||
    nativeEvent.inputType === "historyUndo" ||
    nativeEvent.inputType === "historyRedo"
  ) {
    return false;
  }

  if (!nativeEvent.data) {
    return false;
  }

  // Allow full-string insertions from automation, IMEs, and replacement flows.
  if (nativeEvent.data.length > 1) {
    return false;
  }

  return nativeEvent.data !== "/" && /\D/.test(nativeEvent.data);
};
