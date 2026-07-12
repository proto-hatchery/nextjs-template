"use client";

import {
  LocationCard,
  type LocationCardFormValues,
} from "@/compat/features/public-profile/ui/location-card";
import { useQueryClient } from "@tanstack/react-query";
import { deletePsychologistLocationAction } from "@workspace/supabase-data/actions/psychologists/delete-psychologist-location";
import { upsertPsychologistLocationAction } from "@workspace/supabase-data/actions/psychologists/upsert-psychologist-location";
import { usePsychologistLocations } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LocationsSectionProps {
  /** Whether this is used in onboarding */
  isOnboarding?: boolean;
  /** Callback when a location is added (for onboarding flow) */
  onLocationAdded?: () => void;
  /** Callback when online-only option changes (for onboarding flow) */
  onOnlineOnlyChange?: (onlineOnly: boolean) => void;
}

const emptyFormValues: LocationCardFormValues = {
  name: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
};

function toCardDefaultValues(
  location: NonNullable<ReturnType<typeof usePsychologistLocations>["data"]>[number],
): LocationCardFormValues {
  return {
    id: location.id,
    name: String(location.name ?? ""),
    street: String(location.street ?? ""),
    number: String(location.number ?? ""),
    complement: String(location.complement ?? ""),
    neighborhood: String(location.neighborhood ?? ""),
    city: String(location.city ?? ""),
    state: String(location.state ?? ""),
    postalCode: String(location.postal_code ?? ""),
  };
}

export function LocationsSection({
  isOnboarding = false,
  onLocationAdded,
  onOnlineOnlyChange,
}: LocationsSectionProps = {}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [removingLocationId, setRemovingLocationId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: locations, isPending: isPendingLocations } = usePsychologistLocations();

  const hasLocations = (locations?.length ?? 0) > 0;
  const showNewLocationCard = isAddingNew || (locations?.length === 0 && !isPendingLocations);

  const handleSave = async (values: LocationCardFormValues) => {
    try {
      unwrapActionResult(await upsertPsychologistLocationAction(values));
      void queryClient.invalidateQueries({ queryKey: queryKeys.psychologist.locations() });
      setIsAddingNew(false);
      onLocationAdded?.();
    } catch {
      toast.error("Erro ao salvar endereço.");
      throw new Error("Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    setRemovingLocationId(id);
    try {
      unwrapActionResult(await deletePsychologistLocationAction({ locationId: id }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.psychologist.locations() });
      toast.success("Endereço removido!");
    } catch {
      toast.error("Erro ao remover endereço.");
    } finally {
      setRemovingLocationId(null);
    }
  };

  return (
    <section className="space-y-4">
      {/* Online-only option - onboarding only */}
      {isOnboarding && (
        <div className="rounded-xl bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="online-only"
              checked={onlineOnly}
              onCheckedChange={(checked) => {
                const isChecked = checked === true;
                setOnlineOnly(isChecked);
                onOnlineOnlyChange?.(isChecked);
              }}
              className="mt-1 border-gray-400 data-[state=unchecked]:border-gray-400"
            />
            <div className="space-y-1">
              <label
                htmlFor="online-only"
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Atendo apenas online
              </label>
              <p className="text-sm text-muted-foreground">
                Marque esta opção se você não possui consultório presencial e atende exclusivamente
                por videochamada.
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-200 ${onlineOnly ? "pointer-events-none opacity-40" : ""}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Label className="text-base font-medium">Endereços de Atendimento</Label>
          {!isOnboarding && !showNewLocationCard && (
            <BrandButton onClick={() => setIsAddingNew(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar
            </BrandButton>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {locations?.map((location, idx) => (
            <LocationCard
              key={location.id}
              index={idx + 1}
              name={String(location.name ?? "")}
              street={String(location.street ?? "")}
              number={String(location.number ?? "")}
              city={String(location.city ?? "")}
              state={String(location.state ?? "")}
              defaultValues={toCardDefaultValues(location)}
              onSave={async (values) => {
                await handleSave(values);
              }}
              onRemove={() => void handleDelete(location.id)}
              isRemoving={removingLocationId === location.id}
              showCancelButton
              showRemoveAction={!isOnboarding}
            />
          ))}

          {showNewLocationCard && (
            <LocationCard
              index={(locations?.length ?? 0) + 1}
              name=""
              street=""
              number=""
              city=""
              state=""
              defaultValues={emptyFormValues}
              initialEditing
              onSave={async (values) => {
                await handleSave(values);
              }}
              {...(!(isOnboarding && !hasLocations)
                ? { onCancel: () => setIsAddingNew(false) }
                : {})}
              showCancelButton={!isOnboarding || hasLocations}
              showRemoveAction={false}
            />
          )}
        </div>

        {/* Add another - onboarding when already has locations */}
        {isOnboarding && hasLocations && !isAddingNew && (
          <div className="flex justify-center pt-2">
            <BrandButton
              onClick={() => setIsAddingNew(true)}
              size="sm"
              variant="ghost"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar outro endereço
            </BrandButton>
          </div>
        )}
      </div>
    </section>
  );
}
