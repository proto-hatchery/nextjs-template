"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ActivitiesInfiniteScrollProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasItems: boolean;
}

export function ActivitiesInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  hasItems,
}: ActivitiesInfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div ref={observerTarget} className="flex w-full items-center justify-center py-8">
      {isFetchingNextPage && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando mais atividades...
        </div>
      )}
      {!hasNextPage && hasItems && (
        <p className="text-sm text-muted-foreground">Você chegou ao fim do catálogo.</p>
      )}
    </div>
  );
}
