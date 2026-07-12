import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  threshold?: number;
  onStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  onFinish?: (e: React.MouseEvent | React.TouchEvent) => void;
  onCancel?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function useLongPress(
  callback: (e: React.MouseEvent | React.TouchEvent) => void,
  options: UseLongPressOptions = {},
) {
  const { threshold = 500, onStart, onFinish, onCancel } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      onStart?.(e);
      targetRef.current = e.target;
      timeoutRef.current = setTimeout(() => {
        callback(e);
      }, threshold);
    },
    [callback, threshold, onStart],
  );

  const stop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        onFinish?.(e);
      }
    },
    [onFinish],
  );

  const cancel = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        onCancel?.(e);
      }
    },
    [onCancel],
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => stop(e),
    onMouseLeave: (e: React.MouseEvent) => cancel(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchEnd: (e: React.TouchEvent) => stop(e),
  };
}
