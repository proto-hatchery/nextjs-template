import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import { AvailabilitySupabaseRepository } from "../infrastructure/repositories/availability-supabase.repository";

type TypedSupabaseClient = SupabaseClient<Database>;

export interface PublicAvailabilitySlotDTO {
  date: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_id: string | null;
  delivery_mode: Database["public"]["Enums"]["delivery_mode"] | null;
  available_for_first_appointment: boolean;
  is_exception: boolean;
}

export function getWeeklyAvailabilityConfigForUser(
  supabase: TypedSupabaseClient,
  psychologistId: string,
) {
  return new AvailabilitySupabaseRepository(supabase).getWeeklyConfig(psychologistId);
}

export async function getPublicAvailabilityForRange(
  supabase: TypedSupabaseClient,
  params: {
    psychologistId: string;
    startDate: string;
    endDate: string;
    modality?: "online" | "in_person" | "hybrid";
    locationId?: string;
  },
): Promise<PublicAvailabilitySlotDTO[]> {
  const { psychologistId, startDate, endDate, modality, locationId } = params;

  const { data, error } = await supabase.rpc("get_psychologist_availability", {
    p_psychologist_id: psychologistId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    throw error;
  }

  let slots = (data ?? []) as PublicAvailabilitySlotDTO[];

  if (modality) {
    slots = slots.filter((slot) => {
      if (!slot.delivery_mode) return true;
      if (modality === "online") return slot.delivery_mode === "telehealth";
      if (modality === "in_person") return slot.delivery_mode === "in_person";
      return true;
    });
  }

  if (locationId) {
    slots = slots.filter((slot) => slot.location_id === locationId);
  }

  return slots;
}
