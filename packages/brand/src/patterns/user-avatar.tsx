"use client";

import type * as React from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

export interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  name?: string | null;
  avatarUrl?: string | null;
  /** If true, indicates this is a default Google auto-generated avatar and should show user icon instead */
  isDefaultPhoto?: boolean | null;
  /** If true, always shows user icon in fallback instead of initial (used for auth avatars) */
  alwaysShowIcon?: boolean;
  fallbackClassName?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  isDefaultPhoto,
  alwaysShowIcon = false,
  className,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? "U";

  // If photo is marked as default, don't show the image - show user icon instead
  const shouldShowImage = avatarUrl && isDefaultPhoto !== true;

  // Show user icon if:
  // - alwaysShowIcon is true (for auth avatars)
  // - isDefaultPhoto is true
  // - no name provided
  const shouldShowUserIcon = alwaysShowIcon || isDefaultPhoto === true || !name;

  return (
    <Avatar className={className} {...props}>
      {shouldShowImage ? <AvatarImage src={avatarUrl} alt={name ?? "Avatar"} /> : null}
      <AvatarFallback className={cn("bg-muted", fallbackClassName)}>
        {shouldShowUserIcon ? <User className="h-[60%] w-[60%] text-muted-foreground" /> : initial}
      </AvatarFallback>
    </Avatar>
  );
}
