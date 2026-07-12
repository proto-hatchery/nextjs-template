"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FileText as DocumentTextIcon,
  MoreHorizontal as EllipsisHorizontalIcon,
  Star as StarIcon,
} from "lucide-react";
import type { MouseEvent } from "react";
import { useCallback } from "react";

interface DocumentCardProps {
  title: string;
  category: string;
  type: string;
  description?: string | null;
  isPopular?: boolean;
  onOpenTemplate?: () => void;
  onMoreOptions?: () => void;
}

function DocumentCardHeader({ title, titleId }: { title: string; titleId: string }) {
  return (
    <div className="relative mb-2 flex-shrink-0">
      <h3
        id={titleId}
        className="text-md font-semibold leading-tight text-foreground line-clamp-2"
        title={title}
      >
        {title}
      </h3>
    </div>
  );
}

function DocumentCardBadges({ category, type }: { category: string; type: string }) {
  return (
    <div className="mb-2 flex-shrink-0">
      <div className="flex items-center gap-1.5 overflow-hidden">
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          {category}
        </span>
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
          {type}
        </span>
      </div>
    </div>
  );
}

function DocumentCardPreview({ isPopular }: { isPopular?: boolean }) {
  return (
    <div className="bg-muted relative flex h-44 flex-shrink-0 items-start justify-center overflow-hidden pt-6">
      {isPopular && (
        <div
          className="bg-muted text-muted-foreground absolute right-3 top-3 z-30 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
          aria-hidden="true"
        >
          <StarIcon className="h-3 w-3" aria-hidden="true" />
          <span>Popular</span>
        </div>
      )}

      <div className="bg-background relative z-0 h-40 w-[76%] overflow-hidden rounded-t-sm shadow-sm ring-1 ring-black/5">
        <div className="text-muted-foreground absolute inset-0 mt-12 flex justify-center">
          <DocumentTextIcon className="h-10 w-10 opacity-40" aria-hidden="true" />
        </div>
      </div>
      <div className="from-background/90 absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t to-transparent backdrop-blur-[0.5px]" />
    </div>
  );
}

export function DocumentCard({
  title,
  category,
  type,
  description,
  isPopular,
  onOpenTemplate,
  onMoreOptions,
}: DocumentCardProps) {
  const cardId = `document-card-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const titleId = `${cardId}-title`;

  const handleMoreClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onMoreOptions?.();
    },
    [onMoreOptions],
  );

  return (
    <div className="group relative flex h-[310px] cursor-pointer flex-col overflow-hidden rounded-xl bg-muted/50 shadow-sm transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      <BrandButton
        variant="ghost"
        className="absolute inset-0 z-10 h-auto w-auto p-0"
        aria-labelledby={titleId}
        onClick={() => onOpenTemplate?.()}
      />

      <DocumentCardPreview {...(isPopular !== undefined ? { isPopular } : {})} />

      <div className="flex flex-1 flex-col px-4 py-5">
        <DocumentCardHeader title={title} titleId={titleId} />
        <DocumentCardBadges category={category} type={type} />

        {description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {description}
          </p>
        ) : null}

        <div className="flex-1" />

        <div className="flex flex-shrink-0 items-center justify-end">
          {onMoreOptions ? (
            <BrandButton
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted focus:ring-primary relative z-20 rounded-md p-1 transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none h-6 w-6"
              aria-label={`Mais opções para ${title}`}
              onClick={handleMoreClick}
            >
              <EllipsisHorizontalIcon className="h-4 w-4 opacity-70" aria-hidden="true" />
            </BrandButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
