"use client";

import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

import { SidebarBadge } from "./sidebar-badge";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { useFilteredNavEntries } from "./sidebar-visibility-context";
import type { BadgeConfig, BadgeProp, NavEntry, NavIcon, SidebarNavProps } from "./types";

function RowLink({
  title,
  url,
  icon: Icon,
  activeIcon,
  isActive,
  badge,
  disabled,
  customBadges,
}: {
  title: string;
  url: string;
  icon?: NavIcon;
  activeIcon?: NavIcon;
  isActive: boolean;
  badge?: BadgeProp;
  disabled?: boolean;
  customBadges?: Record<string, BadgeConfig>;
}) {
  const badgeType = typeof badge === "string" ? badge : badge?.type;
  const badgeText = typeof badge === "object" ? badge.text : undefined;
  const DisplayIcon = isActive && activeIcon ? activeIcon : Icon;

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:px-0">
      {disabled ? (
        <SidebarMenuButton
          isActive={isActive}
          tooltip={title}
          disabled={disabled}
          className={cn(
            "px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:mx-auto",
            "opacity-50 cursor-pointer",
          )}
        >
          {DisplayIcon ? <DisplayIcon className="size-4 shrink-0" /> : null}
          <span className="group-data-[collapsible=icon]:hidden flex-1 min-w-0 truncate font-semibold">
            {title}
          </span>
          {badgeType && (
            <SidebarBadge
              type={badgeType}
              {...(badgeText !== undefined ? { text: badgeText } : {})}
              {...(customBadges !== undefined ? { customBadges } : {})}
            />
          )}
        </SidebarMenuButton>
      ) : (
        <Link href={url} title={title} prefetch={true} className="flex w-full">
          <SidebarMenuButton
            isActive={isActive}
            tooltip={title}
            className="px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:mx-auto w-full"
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            <span className="group-data-[collapsible=icon]:hidden flex-1 min-w-0 truncate font-semibold">
              {title}
            </span>
            {badgeType && (
              <SidebarBadge
                type={badgeType}
                {...(badgeText !== undefined ? { text: badgeText } : {})}
                {...(customBadges !== undefined ? { customBadges } : {})}
              />
            )}
          </SidebarMenuButton>
        </Link>
      )}
    </SidebarMenuItem>
  );
}

function CollapsibleItem({
  entry,
  isActive,
  isCollapsed,
  toggleSidebar,
  pathname,
  customBadges,
}: {
  entry: NavEntry;
  isActive: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  pathname: string | null;
  customBadges?: Record<string, BadgeConfig>;
}) {
  const DisplayIcon = isActive && entry.activeIcon ? entry.activeIcon : entry.icon;

  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:px-0" suppressHydrationWarning>
      <SidebarMenuButton
        isActive={false}
        {...(entry.title !== undefined ? { tooltip: entry.title } : {})}
        className="px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:mx-auto"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (isCollapsed) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
          }
        }}
      >
        {DisplayIcon ? <DisplayIcon className="size-4 shrink-0" /> : null}
        <span className="group-data-[collapsible=icon]:hidden flex-1 min-w-0 truncate font-semibold">
          {entry.title}
        </span>
      </SidebarMenuButton>
      <div className="group-data-[collapsible=icon]:hidden">
        <ul className="border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5">
          {entry.children?.map((sub) => {
            if (!sub.title) return null;

            const isSubActive = sub.url ? pathname?.startsWith(sub.url) : false;
            const subBadgeType = typeof sub.badge === "string" ? sub.badge : sub.badge?.type;
            const subBadgeText = typeof sub.badge === "object" ? sub.badge.text : undefined;
            const SubDisplayIcon = isSubActive && sub.activeIcon ? sub.activeIcon : sub.icon;
            return (
              <SidebarMenuSubItem key={sub.title}>
                {sub.disabled ? (
                  <SidebarMenuSubButton
                    isActive={false}
                    title={sub.title}
                    className={cn("opacity-50 cursor-pointer")}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {SubDisplayIcon ? <SubDisplayIcon className="size-4 shrink-0" /> : null}
                      <span className="flex-1 min-w-0 truncate font-semibold">{sub.title}</span>
                      {subBadgeType && (
                        <SidebarBadge
                          type={subBadgeType}
                          {...(subBadgeText !== undefined ? { text: subBadgeText } : {})}
                          {...(customBadges !== undefined ? { customBadges } : {})}
                        />
                      )}
                    </div>
                  </SidebarMenuSubButton>
                ) : (
                  <SidebarMenuSubButton asChild isActive={!!isSubActive}>
                    <Link
                      href={sub.url ?? "#"}
                      title={sub.title}
                      prefetch={true}
                      className="flex items-center gap-2 w-full"
                    >
                      <div className="flex items-center gap-2 w-full">
                        {sub.icon ? <sub.icon className="size-4 shrink-0" /> : null}
                        <span className="flex-1 min-w-0 truncate font-semibold">{sub.title}</span>
                        {subBadgeType && (
                          <SidebarBadge
                            type={subBadgeType}
                            {...(subBadgeText !== undefined ? { text: subBadgeText } : {})}
                            {...(customBadges !== undefined ? { customBadges } : {})}
                          />
                        )}
                      </div>
                    </Link>
                  </SidebarMenuSubButton>
                )}
              </SidebarMenuSubItem>
            );
          })}
        </ul>
      </div>
    </SidebarMenuItem>
  );
}

export function SidebarNav({ navEntries, customBadges }: SidebarNavProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Filter nav entries based on visibility context
  const filteredEntries = useFilteredNavEntries(navEntries);

  // Check if we have sections
  const hasSections = filteredEntries.some((entry) => entry.isSection);

  if (hasSections) {
    return (
      <>
        {filteredEntries.map((section, idx) => {
          if (!section.isSection) {
            if (section.separator) {
              return (
                <div className={cn("w-full py-1", isCollapsed ? "px-2" : "px-0")} key={idx}>
                  <Separator />
                </div>
              );
            }

            const isActive = section.url
              ? pathname?.startsWith(section.url)
              : section.children?.some((s) => s.url && pathname?.startsWith(s.url));

            return (
              <SidebarGroup
                key={section.title ?? idx}
                className="group-data-[collapsible=icon]:p-1 py-1"
              >
                <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:gap-1 px-0">
                  {section.children && section.children.length > 0 ? (
                    <CollapsibleItem
                      entry={section}
                      isActive={!!isActive}
                      isCollapsed={isCollapsed}
                      toggleSidebar={toggleSidebar}
                      pathname={pathname}
                      {...(customBadges !== undefined ? { customBadges } : {})}
                    />
                  ) : (
                    section.title && (
                      <RowLink
                        title={section.title}
                        url={section.url ?? "#"}
                        {...(section.icon !== undefined ? { icon: section.icon } : {})}
                        {...(section.activeIcon !== undefined
                          ? { activeIcon: section.activeIcon }
                          : {})}
                        isActive={!!isActive}
                        {...(section.badge !== undefined ? { badge: section.badge } : {})}
                        {...(section.disabled !== undefined ? { disabled: section.disabled } : {})}
                        {...(customBadges !== undefined ? { customBadges } : {})}
                      />
                    )
                  )}
                </SidebarMenu>
              </SidebarGroup>
            );
          }

          return (
            <SidebarGroup
              key={section.title ?? idx}
              className="group-data-[collapsible=icon]:p-1 py-1"
            >
              {section.title && (
                <>
                  {isCollapsed ? (
                    <div className={cn("w-full py-1", isCollapsed ? "px-2" : "px-0")}>
                      <Separator />
                    </div>
                  ) : (
                    <SidebarGroupLabel className="h-7">{section.title}</SidebarGroupLabel>
                  )}
                </>
              )}
              <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:gap-1 px-0">
                {section.children?.map((entry, childIdx) => {
                  const isActive = entry.url
                    ? pathname?.startsWith(entry.url)
                    : entry.children?.some((s) => s.url && pathname?.startsWith(s.url));

                  if (entry.children && entry.children.length > 0) {
                    return (
                      <CollapsibleItem
                        key={entry.title ?? childIdx}
                        entry={entry}
                        isActive={!!isActive}
                        isCollapsed={isCollapsed}
                        toggleSidebar={toggleSidebar}
                        pathname={pathname}
                        {...(customBadges !== undefined ? { customBadges } : {})}
                      />
                    );
                  }

                  if (!entry.title) return null;

                  return (
                    <RowLink
                      key={entry.title}
                      title={entry.title}
                      url={entry.url ?? "#"}
                      {...(entry.icon !== undefined ? { icon: entry.icon } : {})}
                      {...(entry.activeIcon !== undefined ? { activeIcon: entry.activeIcon } : {})}
                      isActive={!!isActive}
                      {...(entry.badge !== undefined ? { badge: entry.badge } : {})}
                      {...(entry.disabled !== undefined ? { disabled: entry.disabled } : {})}
                      {...(customBadges !== undefined ? { customBadges } : {})}
                    />
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </>
    );
  }

  // Fallback for flat list (backward compatibility)
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:p-1 py-1">
      <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:gap-1 px-0">
        {filteredEntries.map((entry, idx) => {
          if (entry.separator) {
            return (
              <div className={cn("w-full py-1", isCollapsed ? "px-2" : "px-0")} key={idx}>
                <Separator />
              </div>
            );
          }

          const isActive = entry.url
            ? pathname?.startsWith(entry.url)
            : entry.children?.some((s) => s.url && pathname?.startsWith(s.url));

          if (entry.children && entry.children.length > 0) {
            return (
              <CollapsibleItem
                key={entry.title ?? idx}
                entry={entry}
                isActive={!!isActive}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
                pathname={pathname}
                {...(customBadges !== undefined ? { customBadges } : {})}
              />
            );
          }

          if (!entry.title) return null;

          return (
            <RowLink
              key={entry.title}
              title={entry.title}
              url={entry.url ?? "#"}
              {...(entry.icon !== undefined ? { icon: entry.icon } : {})}
              {...(entry.activeIcon !== undefined ? { activeIcon: entry.activeIcon } : {})}
              isActive={!!isActive}
              {...(entry.badge !== undefined ? { badge: entry.badge } : {})}
              {...(entry.disabled !== undefined ? { disabled: entry.disabled } : {})}
              {...(customBadges !== undefined ? { customBadges } : {})}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
