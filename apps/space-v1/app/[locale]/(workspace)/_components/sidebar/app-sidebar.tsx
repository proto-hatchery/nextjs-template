"use client";

import { Sidebar, SidebarContent, SidebarHeader } from "@workspace/ui/components/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { SidebarVisibilityProvider } from "./sidebar-visibility-context";
import type { AppSidebarProps, NavEntry, SidebarVisibilityContext } from "./types";

export interface AppSidebarComponentProps extends Omit<AppSidebarProps, "navEntries"> {
  /** Navigation entries to display */
  navEntries: NavEntry[];
  /** Visibility context for filtering nav items */
  visibilityContext?: SidebarVisibilityContext;
  /** Default open state for sidebar */
  defaultOpen?: boolean;
}

/**
 * Main application sidebar component
 * Flexible and configurable for different apps (space, desk, etc.)
 *
 * IMPORTANT: This component does NOT create a SidebarProvider. It must be used
 * within an existing SidebarProvider from the layout. This prevents nested
 * providers which cause layout issues.
 *
 * @example
 * ```tsx
 * // Basic usage with header
 * <SidebarProvider>
 *   <AppSidebar
 *     navEntries={defaultNavEntries}
 *     headerSlot={<CreateButton />}
 *     visibilityContext={{ app: "space" }}
 *   />
 * </SidebarProvider>
 *
 * // Without header
 * <SidebarProvider>
 *   <AppSidebar
 *     navEntries={defaultNavEntries}
 *     visibilityContext={{ app: "desk" }}
 *   />
 * </SidebarProvider>
 * ```
 */
export function AppSidebar({
  headerSlot,
  navEntries,
  customBadges,
  variant = "sidebar",
  collapsible = "icon",
  visibilityContext,
  defaultOpen: _defaultOpen = true,
  className,
  ...props
}: AppSidebarComponentProps) {
  // Just render the Sidebar - don't create a nested SidebarProvider
  const sidebarContent = (
    <Sidebar variant={variant} collapsible={collapsible} className={className} {...props}>
      {/* Header is optional - only render if headerSlot is provided */}
      {headerSlot !== undefined && headerSlot !== null && (
        <SidebarHeader>{headerSlot}</SidebarHeader>
      )}

      {/* Main navigation content */}
      <SidebarContent className="px-3 pt-2 group-data-[collapsible=icon]:px-0">
        <SidebarNav
          navEntries={navEntries}
          {...(customBadges !== undefined ? { customBadges } : {})}
        />
      </SidebarContent>
    </Sidebar>
  );

  // Wrap with visibility provider if context is provided
  if (visibilityContext) {
    return (
      <SidebarVisibilityProvider context={visibilityContext}>
        {sidebarContent}
      </SidebarVisibilityProvider>
    );
  }

  return sidebarContent;
}
