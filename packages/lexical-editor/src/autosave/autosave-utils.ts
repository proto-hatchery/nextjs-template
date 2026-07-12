/**
 * Utility functions for the robust auto-save system.
 *
 * @see ADR-015 for architecture decisions
 */

/**
 * Generate a stable hash for content deduplication.
 * Uses a simple djb2 algorithm for speed and simplicity.
 */
export function stableHash(content: string): string {
  let hash = 5381;
  for (let i = 0; i < content.length; i += 1) {
    hash = Math.trunc(hash * 33 + content.charCodeAt(i));
  }
  return hash.toString(16);
}

/**
 * Check if an error is a conflict error (HTTP 409).
 */
export function isConflictError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("conflict") ||
      message.includes("409") ||
      message.includes("version mismatch")
    );
  }
  return false;
}

/**
 * Check if an error is a network error.
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("offline") ||
      message.includes("timeout")
    );
  }
  return false;
}

/**
 * Throttle function with flush capability.
 * Ensures the function is called at most once per `wait` milliseconds.
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number,
): ((...args: TArgs) => void) & { flush: () => void; cancel: () => void } {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const throttled = (...args: TArgs) => {
    lastArgs = args;
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= wait) {
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCall = Date.now();
        if (lastArgs) {
          fn(...lastArgs);
        }
      }, wait - timeSinceLastCall);
    }
  };

  throttled.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastArgs) {
      lastCall = Date.now();
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return throttled as ((...args: TArgs) => void) & { flush: () => void; cancel: () => void };
}

/**
 * Debounce function with flush capability.
 * Delays function execution until after `wait` milliseconds of inactivity.
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number,
): ((...args: TArgs) => void) & { flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = (...args: TArgs) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (lastArgs) {
        fn(...lastArgs);
      }
    }, wait);
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return debounced as ((...args: TArgs) => void) & { flush: () => void; cancel: () => void };
}

/**
 * Format time ago for display (e.g., "há 5s", "há 2min").
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return `há ${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `há ${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `há ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}
