"use client";

import { ActivityCard, ActivityCardSkeleton } from "@/compat/features/patients/ui/activity-card";
import type { ActivityReference } from "@workspace/supabase-data/types/entities";
import { getPublicStorageUrl } from "@/compat/supabase/utils/storage";

export type Activity = ActivityReference;

interface ActivitiesGridProps {
  activities: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  isPending?: boolean;
}

export function ActivitiesGrid({ activities, onActivitySelect, isPending }: ActivitiesGridProps) {
  const imageBucket = "activity-images";

  const getImageUrl = (path: string | null) => {
    return getPublicStorageUrl(imageBucket, path) ?? undefined;
  };

  if (isPending && activities.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ActivityCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Nenhuma atividade encontrada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-10">
      {activities.map((activity) => {
        const imageUrl = getImageUrl(activity.image_path);
        const category = activity.activity_kind ?? undefined;

        return (
          <ActivityCard
            key={activity.id}
            onSelect={() => onActivitySelect?.(activity)}
            className="h-full"
            item={{
              id: activity.id,
              title: activity.name ?? "",
              description: activity.description ?? "",
              ...(imageUrl !== undefined ? { imageUrl } : {}),
              ...(category !== undefined ? { category } : {}),
              createdBy: "Equipe Fluri",
            }}
          />
        );
      })}
    </div>
  );
}
