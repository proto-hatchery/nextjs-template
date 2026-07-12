import type { SupabaseClient } from "@supabase/supabase-js";
import type { Result } from "neverthrow";
import type { AppError } from "../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  UpdatePsychologistCredentialsDTO,
  UpdatePsychologistProfileDTO,
  UpsertPsychologistLocationDTO,
  UpsertPsychologistServiceDTO,
} from "../domain/dto/psychologist.dto";
import { PsychologistSupabaseRepository } from "../infrastructure/repositories/psychologist-supabase.repository";

export function updatePsychologistProfile(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  input: UpdatePsychologistProfileDTO,
): Promise<Result<void, AppError>> {
  return new PsychologistSupabaseRepository(supabase).updateProfile(psychologistId, input);
}

export function updatePsychologistCredentials(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  input: UpdatePsychologistCredentialsDTO,
): Promise<Result<void, AppError>> {
  return new PsychologistSupabaseRepository(supabase).updateCredentials(psychologistId, input);
}

export function upsertPsychologistService(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  input: UpsertPsychologistServiceDTO,
): Promise<Result<{ id: string }, AppError>> {
  return new PsychologistSupabaseRepository(supabase).upsertService(psychologistId, input);
}

export function deletePsychologistService(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  serviceId: string,
): Promise<Result<void, AppError>> {
  return new PsychologistSupabaseRepository(supabase).deleteService(psychologistId, serviceId);
}

export function upsertPsychologistLocation(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  input: UpsertPsychologistLocationDTO,
): Promise<Result<{ id: string }, AppError>> {
  return new PsychologistSupabaseRepository(supabase).upsertLocation(psychologistId, input);
}

export function deletePsychologistLocation(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
  locationId: string,
): Promise<Result<void, AppError>> {
  return new PsychologistSupabaseRepository(supabase).deleteLocation(psychologistId, locationId);
}
