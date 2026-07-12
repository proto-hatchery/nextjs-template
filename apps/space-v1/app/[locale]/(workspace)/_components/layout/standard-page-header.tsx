"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import React from "react";

interface PageHeaderBreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "neutral" | "ghost" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface NavigationConfig {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
  labels?: {
    previous?: string;
    next?: string;
  };
}

interface ActionsMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  tooltip?: string;
  separator?: boolean;
}

interface ActionsMenuConfig {
  label?: string;
  items: ActionsMenuItem[];
}

interface PageHeaderProps {
  breadcrumb?: {
    items: PageHeaderBreadcrumbItem[];
  };
  title?: string;
  subtitle?: string;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  navigation?: NavigationConfig;
  actionsMenu?: ActionsMenuConfig;
  className?: string;
  children?: React.ReactNode;
}

export function StandardPageHeader({
  breadcrumb,
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  navigation,
  actionsMenu,
  className,
  children,
}: PageHeaderProps) {
  // Custom children override everything
  if (children) {
    return <div className={cn("hidden md:flex flex-col gap-3 py-3", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "hidden md:flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/* Left section: Breadcrumb or Title */}
      <div className="flex flex-col gap-1">
        {breadcrumb && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.items.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href} className="inline-flex items-center gap-1.5">
                        {item.icon && (
                          <span className="inline-flex" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="inline-flex items-center gap-1.5">
                        {item.icon && (
                          <span className="inline-flex" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {title && (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right section: Navigation + Actions */}
      <div className="flex items-center gap-2">
        {/* Navigation (for detail pages) */}
        {navigation && (
          <>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              {navigation.current}/{navigation.total}
            </span>

            <BrandButton
              variant="neutral"
              size="sm"
              className={cn(
                "gap-2",
                navigation.disablePrevious && "pointer-events-none opacity-50",
              )}
              onClick={navigation.onPrevious}
              disabled={navigation.disablePrevious}
            >
              <span className="hidden sm:inline">{navigation.labels?.previous ?? "Anterior"}</span>
            </BrandButton>

            <BrandButton
              variant="neutral"
              size="sm"
              className={cn("gap-2", navigation.disableNext && "pointer-events-none opacity-50")}
              onClick={navigation.onNext}
              disabled={navigation.disableNext}
            >
              <span className="hidden sm:inline">{navigation.labels?.next ?? "Próxima"}</span>
            </BrandButton>
          </>
        )}

        {/* Secondary Actions */}
        {secondaryActions?.map((action, index) => (
          <BrandButton
            key={index}
            variant={action.variant ?? "neutral"}
            size="sm"
            onClick={action.onClick}
            disabled={(action.disabled ?? false) || (action.loading ?? false)}
            className={cn("gap-2", action.className)}
          >
            {action.icon}
            <span>{action.label}</span>
          </BrandButton>
        ))}

        {/* Primary Action */}
        {primaryAction && (
          <BrandButton
            onClick={primaryAction.onClick}
            disabled={(primaryAction.disabled ?? false) || (primaryAction.loading ?? false)}
            size="sm"
            variant={primaryAction.variant ?? "default"}
            className={primaryAction.className}
          >
            {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
            {primaryAction.label}
          </BrandButton>
        )}

        {/* Actions Menu */}
        {actionsMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BrandButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={actionsMenu.label ?? "Mais ações"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <title>{actionsMenu.label ?? "Mais ações"}</title>
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </BrandButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actionsMenu.label && (
                <>
                  <DropdownMenuLabel>{actionsMenu.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              {actionsMenu.items.map((item, index) => (
                <React.Fragment key={index}>
                  {item.separator && <DropdownMenuSeparator />}
                  {item.tooltip && item.disabled ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem
                          {...(item.disabled !== undefined ? { disabled: item.disabled } : {})}
                          onClick={item.onClick}
                          className={cn(
                            item.variant === "destructive" &&
                              "text-destructive focus:text-destructive",
                          )}
                        >
                          {item.icon && <span className="mr-2">{item.icon}</span>}
                          {item.label}
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <DropdownMenuItem
                      {...(item.disabled !== undefined ? { disabled: item.disabled } : {})}
                      onClick={item.onClick}
                      className={cn(
                        item.variant === "destructive" && "text-destructive focus:text-destructive",
                      )}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </DropdownMenuItem>
                  )}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
