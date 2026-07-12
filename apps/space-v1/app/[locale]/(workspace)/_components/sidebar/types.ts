import type * as React from "react";

/**
 * Icon type for navigation items
 */
export type NavIcon = React.ElementType;

/**
 * Badge types for navigation items
 * Can be extended with custom badges via customBadges prop
 */
export type BadgeType = "comingSoon" | "new" | "beta" | "pro" | "lock";

/**
 * Badge configuration
 */
export interface BadgeConfig {
  text: string;
  className: string;
}

/**
 * Badge prop - can be a simple type or an object with custom text
 */
export type BadgeProp = BadgeType | { type: BadgeType; text?: string };

/**
 * Predefined app identifiers for visibility guards
 */
export type AppGuard = "space" | "desk" | "admin" | "me" | "web";

/**
 * Predefined feature flags for visibility guards
 */
export type FeatureGuard = "pro" | "beta" | "alpha";

/**
 * Visibility guard - can be:
 * - A string identifier (app name or feature flag)
 * - A function that receives context and returns boolean
 */
export type VisibilityGuard = string | ((context: SidebarVisibilityContext) => boolean);

/**
 * Context passed to visibility guard functions
 */
export interface SidebarVisibilityContext {
  /** Current app identifier (e.g., "space", "desk") */
  app: string;
  /** User role if applicable */
  role?: string;
  /** Enabled feature flags */
  features?: string[];
  /** Custom data for complex guard logic */
  custom?: Record<string, unknown>;
}

/**
 * Navigation sub-item (child of a collapsible group)
 */
export interface NavSubItem {
  /** Display title */
  title: string;
  /** Navigation URL */
  url: string;
  /** Optional icon */
  icon?: NavIcon;
  /** Optional active state icon */
  activeIcon?: NavIcon;
  /** Optional badge */
  badge?: BadgeProp;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Visibility guards - item is visible when ALL guards pass */
  visibleWhen?: VisibilityGuard | VisibilityGuard[];
}

/**
 * Navigation entry - can be:
 * - A simple link item
 * - A collapsible group with children
 * - A separator
 */
export interface NavEntry {
  /** Display title (required for link items and groups) */
  title?: string;
  /** Navigation URL (for simple link items) */
  url?: string;
  /** Icon for the item */
  icon?: NavIcon;
  /** Active state icon for the item */
  activeIcon?: NavIcon;
  /** Children for collapsible groups */
  children?: NavEntry[];
  /** Whether this entry is a visual separator */
  separator?: boolean;
  /** Optional badge */
  badge?: BadgeProp;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Visibility guards - item is visible when ALL guards pass */
  visibleWhen?: VisibilityGuard | VisibilityGuard[];
  /** Whether this entry is a section header */
  isSection?: boolean;
}

/**
 * Props for the AppSidebar component
 */
export interface AppSidebarProps extends React.ComponentProps<"div"> {
  /** Custom header content - pass null/undefined to hide header */
  headerSlot?: React.ReactNode;
  /** Navigation entries to display */
  navEntries?: NavEntry[];
  /** Custom badges configuration to extend default badges */
  customBadges?: Record<string, BadgeConfig>;
  /** Sidebar variant */
  variant?: "sidebar" | "floating" | "inset";
  /** Collapsible behavior */
  collapsible?: "offcanvas" | "icon" | "none";
}

/**
 * Props for the SidebarNav component
 */
export interface SidebarNavProps {
  /** Navigation entries to display */
  navEntries: NavEntry[];
  /** Custom badges configuration */
  customBadges?: Record<string, BadgeConfig>;
}

/**
 * Props for the SidebarVisibilityProvider
 */
export interface SidebarVisibilityProviderProps {
  children: React.ReactNode;
  /** Visibility context for filtering nav items */
  context: SidebarVisibilityContext;
}
