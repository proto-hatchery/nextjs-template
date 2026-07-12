"use client";

import {
  ServiceCard,
  type ServiceCardFormValues,
} from "@/compat/features/public-profile/ui/service-card";
import { useQueryClient } from "@tanstack/react-query";
import { deletePsychologistServiceAction } from "@workspace/supabase-data/actions/psychologists/delete-psychologist-service";
import { upsertPsychologistServiceAction } from "@workspace/supabase-data/actions/psychologists/upsert-psychologist-service";
import { useServicesCatalog } from "@workspace/supabase-data/hooks/catalogs";
import { usePsychologistServices } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { safeLogger } from "@workspace/supabase-data/utils/safe-logger";
import { Label } from "@workspace/ui/components/label";
import { formatCurrency } from "@workspace/ui/lib/format";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ServicesSectionProps {
  /** Whether this is used in onboarding (shows initial card, no cancel button) */
  isOnboarding?: boolean;
}

export function ServicesSection({ isOnboarding = false }: ServicesSectionProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: services, isPending: isPendingServices } = usePsychologistServices();
  const { data: servicesCatalog } = useServicesCatalog();

  const getPriceInCents = useCallback((formattedPrice: string): number => {
    const numbers = formattedPrice.replace(/\D/g, "");
    return parseInt(numbers, 10) || 0;
  }, []);

  const handleSave = useCallback(
    async (serviceId: string, values: ServiceCardFormValues): Promise<void> => {
      const priceInCents = getPriceInCents(values.price);
      if (priceInCents <= 0) {
        toast.error("O valor deve ser maior que zero");
        throw new Error("Invalid price");
      }

      unwrapActionResult(
        await upsertPsychologistServiceAction({
        ...(serviceId ? { id: serviceId } : {}),
        serviceId: values.serviceId,
        price: priceInCents,
        durationMinutes: values.durationMinutes,
        notes: "",
        isActive: true,
        }),
      );

      void queryClient.invalidateQueries({ queryKey: queryKeys.psychologist.services() });
    },
    [getPriceInCents, queryClient],
  );

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      setRemovingServiceId(id);
      try {
        unwrapActionResult(await deletePsychologistServiceAction({ serviceId: id }));
        void queryClient.invalidateQueries({ queryKey: queryKeys.psychologist.services() });
        toast.success("Serviço removido!");
      } catch (error) {
        toast.error("Erro ao remover serviço.");
        throw error;
      } finally {
        setRemovingServiceId(null);
      }
    },
    [queryClient],
  );

  const handleUpdateExisting = useCallback(
    async (serviceId: string, values: ServiceCardFormValues): Promise<void> => {
      try {
        await handleSave(serviceId, values);
        toast.success("Serviço atualizado!");
      } catch (error) {
        safeLogger.error("[ServicesSection] Failed to update service", {
          error,
          serviceId,
          values,
        });
        const message = error instanceof Error ? error.message : "Erro ao atualizar serviço.";
        toast.error(message);
        throw error;
      }
    },
    [handleSave],
  );

  const handleCreateNew = useCallback(
    async (values: ServiceCardFormValues): Promise<void> => {
      try {
        await handleSave("", values);
        setIsAddingNew(false);
        if (!isOnboarding) {
          toast.success("Serviço adicionado!");
        }
      } catch (error) {
        safeLogger.error("[ServicesSection] Failed to create service", { error, values });
        const message = error instanceof Error ? error.message : "Erro ao adicionar serviço.";
        toast.error(message);
        throw error;
      }
    },
    [handleSave, isOnboarding],
  );

  const hasServices = (services?.length ?? 0) > 0;
  const showEmptyState = !isOnboarding && !hasServices && !isPendingServices && !isAddingNew;
  // Onboarding: show new card if adding new or if finished loading and verified no services exist
  const showNewServiceCard = isAddingNew || (isOnboarding && !hasServices && !isPendingServices);

  const catalogOptions =
    servicesCatalog?.map((item) => ({ value: item.id, label: item.name })) ?? [];

  return (
    <section className="space-y-4">
      {!isOnboarding && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Serviços Oferecidos</Label>
            <p className="text-sm text-muted-foreground">Tipos de atendimento e valores.</p>
          </div>
          <BrandButton onClick={() => setIsAddingNew(true)} size="small" disabled={isAddingNew}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </BrandButton>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* Existing services */}
        {services?.map((service, idx) => (
          <ServiceCard
            key={service.id}
            index={idx + 1}
            title={service.reference?.name ?? service.name ?? "Serviço sem nome"}
            subtitle="Sessão padrão"
            price={service.price ?? 0}
            durationMinutes={service.duration_minutes ?? 50}
            defaultValues={{
              serviceId: service.reference?.id ?? "",
              price: formatCurrency(service.price ?? 0),
              durationMinutes: Number(service.duration_minutes ?? 50),
            }}
            servicesCatalog={catalogOptions}
            onSave={(values) => handleUpdateExisting(service.id, values)}
            onRemove={() => void handleDelete(service.id)}
            isRemoving={removingServiceId === service.id}
          />
        ))}

        {/* New service form - uses the same ServiceCard component */}
        {showNewServiceCard && (
          <ServiceCard
            index={(services?.length ?? 0) + 1}
            title="Novo Serviço"
            subtitle="Sessão padrão"
            price={0}
            durationMinutes={50}
            defaultValues={{
              serviceId: "",
              price: "",
              durationMinutes: 50,
            }}
            servicesCatalog={catalogOptions}
            initialEditing={true}
            onSave={handleCreateNew}
            {...(!(isOnboarding && !hasServices) ? { onCancel: () => setIsAddingNew(false) } : {})}
            showCancelButton={!isOnboarding || hasServices}
          />
        )}
      </div>

      {/* Add more button - only in onboarding when services exist */}
      {isOnboarding && hasServices && !isAddingNew && (
        <div className="flex justify-center pt-2">
          <BrandButton onClick={() => setIsAddingNew(true)} size="small" variant="ghost">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar outro serviço
          </BrandButton>
        </div>
      )}

      {/* Empty state - only in preferences */}
      {showEmptyState && (
        <div className="rounded-xl bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum serviço cadastrado. Clique em &quot;Adicionar&quot; para começar.
          </p>
        </div>
      )}
    </section>
  );
}
