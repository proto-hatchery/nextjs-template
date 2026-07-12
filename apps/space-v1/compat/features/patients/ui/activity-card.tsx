"use client";

import Image from "next/image";
import { useState } from "react";
import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { FluriIcon } from "@workspace/ui/assets";
import { Skeleton } from "@workspace/ui/components/skeleton";

// Same fallback image used in DocumentCard
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1698044048234-2e7f6c4e6aca?q=80&w=1000&auto=format";

export interface ActivityAudienceTag {
  id: string;
  label: string;
}

export interface ActivityCardItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  audiences?: ActivityAudienceTag[];
  createdBy?: string;
  creatorAvatarUrl?: string;
}

export interface ActivityCardProps {
  item: ActivityCardItem;
  className?: string;
  onSelect?: (id: string) => void;
}

export function ActivityCard({ item, className, onSelect }: ActivityCardProps) {
  const [imageError, setImageError] = useState(false);

  // Use the activity image if available and no error, otherwise use fallback
  const displayImageUrl = item.imageUrl && !imageError ? item.imageUrl : FALLBACK_IMG;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(item.id);
    }
  };

  return (
    <div
      className={cn(
        "group block overflow-hidden rounded-xl bg-card text-sm transition-all duration-200 hover:bg-muted/50 hover:shadow-md cursor-pointer",
        className,
      )}
      onClick={() => onSelect?.(item.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="relative h-40 w-full border-b overflow-hidden bg-muted">
        <Image
          src={displayImageUrl}
          alt={item.title}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="p-4">
        <h3 className="mb-1.5 line-clamp-1 text-lg font-semibold tracking-tight text-foreground">
          {item.title}
        </h3>
        {item.description && (
          <p className="mb-4 line-clamp-3 text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center font-medium">
            <Avatar className="mr-2 size-6">
              <AvatarImage src={item.creatorAvatarUrl} />
              <AvatarFallback className="bg-background">
                {!item.createdBy || item.createdBy === "Equipe Fluri" ? (
                  <FluriIcon className="size-2.5" />
                ) : (
                  <span className="text-[10px]">
                    {item.createdBy.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </AvatarFallback>
            </Avatar>
            <span>{item.createdBy || "Equipe Fluri"}</span>
          </div>

          {item.category && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 uppercase tracking-wider font-bold bg-muted/50"
            >
              {item.category}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivityCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-card shadow-sm", className)}>
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
