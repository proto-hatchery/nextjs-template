import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@workspace/supabase-infra/types/database";
import { PsychologistSupabaseRepository } from "../infrastructure/repositories/psychologist-supabase.repository";

export async function getPsychologist(supabase: SupabaseClient<Database>, psychologistId: string) {
  const result = await new PsychologistSupabaseRepository(supabase).findById(psychologistId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return result.value;
}

export async function getPsychologistServices(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
) {
  const result = await new PsychologistSupabaseRepository(supabase).findServices(psychologistId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return result.value;
}

export async function getPsychologistLocations(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
) {
  const result = await new PsychologistSupabaseRepository(supabase).findLocations(psychologistId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return result.value;
}

export async function getPsychologistOnboardingState(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
) {
  const result = await new PsychologistSupabaseRepository(supabase).findOnboardingState(
    psychologistId,
  );
  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  return result.value;
}
