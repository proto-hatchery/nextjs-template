"use client";

import * as React from "react";

import type {
  NavEntry,
  SidebarVisibilityContext,
  SidebarVisibilityProviderProps,
  VisibilityGuard,
} from "./types";

const SidebarVisibilityContextReact = React.createContext<SidebarVisibilityContext | null>(null);

/**
 * Hook to access the sidebar visibility context
 */
export function useSidebarVisibility(): SidebarVisibilityContext | null {
  return React.useContext(SidebarVisibilityContextReact);
}

/**
 * Check if a single guard passes
 */
function checkGuard(guard: VisibilityGuard, context: SidebarVisibilityContext): boolean {
  // If guard is a function, call it with context
  if (typeof guard === "function") {
    return guard(context);
  }

  // If guard is a string, check if it matches app or is in features
  if (typeof guard === "string") {
    // Check if it matches the current app
    if (guard === context.app) {
      return true;
    }

    // Check if it's in the features array
    if (context.features?.includes(guard)) {
      return true;
    }

    // Check if it matches the role
    if (guard === context.role) {
      return true;
    }

    return false;
  }

  return false;
}

/**
 * Check if an item is visible based on its guards
 * Returns true if no guards are specified (default visible)
 * Returns true if ALL guards pass
 */
export function isItemVisible(
  visibleWhen: VisibilityGuard | VisibilityGuard[] | undefined,
  context: SidebarVisibilityContext,
): boolean {
  // No guards means always visible
  if (!visibleWhen) {
    return true;
  }

  // Single guard
  if (!Array.isArray(visibleWhen)) {
    return checkGuard(visibleWhen, context);
  }

  // Multiple guards - ANY must pass (OR logic for flexibility)
  // Use case: visibleWhen: ["space", "desk"] means visible in both apps
  return visibleWhen.some((guard) => checkGuard(guard, context));
}

/**
 * Filter navigation entries based on visibility context
 */
export function filterNavEntries(
  entries: NavEntry[],
  context: SidebarVisibilityContext,
): NavEntry[] {
  return entries
    .filter((entry) => {
      // Separators are always visible
      if (entry.separator) {
        return true;
      }

      return isItemVisible(entry.visibleWhen, context);
    })
    .map((entry) => {
      // If entry has children, filter them too
      if (entry.children && entry.children.length > 0) {
        const filteredChildren = entry.children.filter((child) =>
          isItemVisible(child.visibleWhen, context),
        );

        // If all children are filtered out, hide the parent too
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...entry,
          children: filteredChildren,
        };
      }

      return entry;
    })
    .filter((entry): entry is NavEntry => entry !== null);
}

/**
 * Hook to get filtered nav entries based on visibility context
 */
export function useFilteredNavEntries(entries: NavEntry[]): NavEntry[] {
  const context = useSidebarVisibility();

  return React.useMemo(() => {
    if (!context) {
      // No context means show all items
      return entries;
    }

    return filterNavEntries(entries, context);
  }, [entries, context]);
}

/**
 * Provider component for sidebar visibility context
 */
export function SidebarVisibilityProvider({ children, context }: SidebarVisibilityProviderProps) {
  return (
    <SidebarVisibilityContextReact.Provider value={context}>
      {children}
    </SidebarVisibilityContextReact.Provider>
  );
}
