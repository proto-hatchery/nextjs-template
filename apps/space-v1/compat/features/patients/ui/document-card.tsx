"use client";

import { cn } from "@workspace/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import type React from "react";
import { BrandButton } from "@workspace/brand/components/brand-button";

export interface DocumentCardProps {
  title: string;
  category: string;
  description?: string;
  date?: string;
  preview?: {
    icon?: React.ReactNode;
    title: string;
    url?: string;
    image?: string;
  };
  onOpenTemplate?: () => void;
  onMoreOptions?: () => void;
  className?: string;
}

export function DocumentCard({
  title,
  category,
  description,
  date,
  preview,
  onOpenTemplate,
  onMoreOptions,
  className,
}: DocumentCardProps) {
  const handleMoreOptions = (event: React.MouseEvent) => {
    event.stopPropagation();
    onMoreOptions?.();
  };

  const handleOpen = () => {
    onOpenTemplate?.();
  };

  // Use Unsplash placeholder as default image
  const previewImage =
    preview?.image ??
    "https://images.unsplash.com/photo-1698044048234-2e7f6c4e6aca?q=80&w=1000&auto=format";

  return (
    <li>
      <BrandButton
        variant="ghost"
        className={cn(
          "group relative grid w-full gap-6 p-4 text-left h-auto",
          "grid-cols-[200px_1fr]",
          className,
        )}
        onClick={handleOpen}
      >
        {/* Image Preview */}
        <img
          loading="lazy"
          decoding="async"
          src={previewImage}
          width={200}
          height={120}
          alt={title}
          className="h-36 rounded-md object-cover"
        />

        {/* Content */}
        <div className="flex flex-col space-y-2">
          {/* Title */}
          <span className="text-xl font-semibold leading-tight text-foreground">{title}</span>

          {/* Metadata Row */}
          <div className="text-muted-foreground">
            <span className="font-medium">{category}</span>
            {date && (
              <>
                <span className="mx-2">•</span>
                <span>{date}</span>
              </>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="line-clamp-3 text-muted-foreground font-normal">{description}</p>
          )}

          {/* Optional: More Options Button */}
          {onMoreOptions && (
            <div className="mt-auto flex justify-end">
              <BrandButton
                variant="ghost"
                size="icon-sm"
                className="relative z-10"
                aria-label={`Mais opções para ${title}`}
                onClick={handleMoreOptions}
              >
                <MoreHorizontal className="h-4 w-4" />
              </BrandButton>
            </div>
          )}
        </div>
      </BrandButton>
    </li>
  );
}
