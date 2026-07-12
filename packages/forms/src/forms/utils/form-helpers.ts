/**
 * React Hook Form helper utilities
 * Utilities for working with React Hook Form
 */

import type { FieldError, FieldErrors } from "react-hook-form";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const hasMessage = (value: unknown): value is FieldError => isRecord(value) && "message" in value;

/**
 * Gets a field error by property path (supports nested paths with dot notation)
 * @param path - The field path (e.g., "user.address.street")
 * @param errors - The form errors object
 * @param separator - The path separator (default: ".")
 * @returns The field error or undefined
 */
export function getByProperty(
  path: string,
  errors?: FieldErrors,
  separator = ".",
): FieldError | undefined {
  if (!errors || !path) return undefined;

  const properties = path.split(separator);

  let current: unknown = errors;

  for (const property of properties) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (/^\d+$/.test(property) && Array.isArray(current)) {
      const index = Number.parseInt(property, 10);
      current = current[index];
      continue;
    }

    if (isRecord(current) && property in current) {
      current = current[property];
      continue;
    }

    return undefined;
  }

  if (hasMessage(current)) {
    return current;
  }

  return undefined;
}

/**
 * Focuses the first invalid field in the form
 * @param errors - The form errors object
 */
export function focusFirstInvalidField(errors?: FieldErrors) {
  if (!errors) return;
  const flatten = (obj: unknown, prefix = ""): string[] => {
    if (!obj || !isRecord(obj)) return [];
    const entries = Object.entries(obj);
    const paths: string[] = [];
    for (const [key, value] of entries) {
      const next = prefix ? `${prefix}.${key}` : key;
      if (hasMessage(value)) {
        paths.push(next);
      } else if (isRecord(value)) {
        paths.push(...flatten(value, next));
      }
    }
    return paths;
  };
  const paths = flatten(errors);
  const first = paths[0];
  if (!first) return;
  // Try find element by name or aria-describedby pattern
  const byName = document.querySelector(`[name="${first}"]`) as HTMLElement | null;
  if (byName) {
    byName.focus();
    return;
  }
  // Fallback: split path and try last segment id
  const id = first.split(".").pop();
  if (!id) return;
  const byId = document.getElementById(id);
  (byId as HTMLElement | null)?.focus?.();
}
