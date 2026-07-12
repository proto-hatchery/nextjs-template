import { err, ok, type Result } from "neverthrow";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, AppErrorCode } from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { PsychologistRepository } from "../../domain/ports/psychologist-repository.port";
import {
  type PsychologistDTO,
  type PsychologistLocationDTO,
  type PsychologistOnboardingStateDTO,
  type PsychologistServiceWithReferenceDTO,
  type UpdatePsychologistCredentialsDTO,
  type UpdatePsychologistProfileDTO,
  type UpsertPsychologistLocationDTO,
  type UpsertPsychologistServiceDTO,
} from "../../domain/dto/psychologist.dto";
import { buildPsychologistFullName } from "../../domain/utils/psychologist-name";
import { toPsychologistServiceWithReferenceDTO } from "../mappers/psychologist.mapper";

const VALID_CRP_STATES = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);
const CRP_FORMAT_REGEX = /^\d{2}\/\d{3,6}(?:-\d)?$/;

function toInfraError(message: string, cause?: unknown) {
  return AppError.infra(AppErrorCode.INFRA_SUPABASE, message, cause);
}

function toValidationError(message: string) {
  return AppError.validation(AppErrorCode.VALIDATION_INVALID_INPUT, message);
}

export class PsychologistSupabaseRepository implements PsychologistRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(psychologistId: string): Promise<Result<PsychologistDTO | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("user_psychologists")
        .select("*")
        .eq("id", psychologistId)
        .maybeSingle();

      if (error) {
        return err(toInfraError("Failed to fetch psychologist", error));
      }

      return ok(data);
    } catch (error) {
      return err(toInfraError("Unexpected error fetching psychologist", error));
    }
  }

  async findServices(
    psychologistId: string,
  ): Promise<Result<PsychologistServiceWithReferenceDTO[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_services")
        .select(
          `
          *,
          reference:reference_values (
            id,
            name:label_pt,
            code:value,
            metadata
          )
        `,
        )
        .eq("psychologist_id", psychologistId)
        .order("created_at", { ascending: false });

      if (error) {
        return err(toInfraError("Failed to fetch psychologist services", error));
      }

      return ok((data ?? []).map(toPsychologistServiceWithReferenceDTO));
    } catch (error) {
      return err(toInfraError("Unexpected error fetching psychologist services", error));
    }
  }

  async findLocations(
    psychologistId: string,
  ): Promise<Result<PsychologistLocationDTO[], AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("public_locations")
        .select("*")
        .eq("psychologist_id", psychologistId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        return err(toInfraError("Failed to fetch psychologist locations", error));
      }

      return ok(data ?? []);
    } catch (error) {
      return err(toInfraError("Unexpected error fetching psychologist locations", error));
    }
  }

  async findOnboardingState(
    psychologistId: string,
  ): Promise<Result<PsychologistOnboardingStateDTO | null, AppError>> {
    try {
      const { data, error } = await this.supabase
        .from("psychologist_onboarding_state")
        .select("*")
        .eq("psychologist_id", psychologistId)
        .maybeSingle();

      if (error) {
        return err(toInfraError("Failed to fetch psychologist onboarding state", error));
      }

      return ok(data);
    } catch (error) {
      return err(toInfraError("Unexpected error fetching psychologist onboarding state", error));
    }
  }

  async updateProfile(
    psychologistId: string,
    input: UpdatePsychologistProfileDTO,
  ): Promise<Result<void, AppError>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (input.fullName !== undefined) updateData.full_name = input.fullName;
      if (input.displayName !== undefined) updateData.display_name = input.displayName;
      if (input.firstName !== undefined) updateData.first_name = input.firstName;
      if (input.lastName !== undefined) updateData.last_name = input.lastName;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.dateOfBirth !== undefined) updateData.date_of_birth = input.dateOfBirth;
      if (input.gender !== undefined) updateData.gender = input.gender;
      if (input.pronouns !== undefined) updateData.pronouns = input.pronouns;
      if (input.cpf !== undefined) updateData.cpf = input.cpf;
      if (input.rg !== undefined) updateData.rg = input.rg;
      if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
      if (input.businessType !== undefined) updateData.business_type = input.businessType;
      if (input.cnpj !== undefined) updateData.cnpj = input.cnpj;
      if (input.companyName !== undefined) updateData.company_name = input.companyName;
      if (input.timezone !== undefined) updateData.timezone = input.timezone;

      if (
        input.fullName === undefined &&
        (input.firstName !== undefined || input.lastName !== undefined)
      ) {
        const { data: currentNames, error: currentNamesError } = await this.supabase
          .from("user_psychologists")
          .select("first_name, last_name")
          .eq("id", psychologistId)
          .maybeSingle();

        if (currentNamesError) {
          return err(toInfraError("Failed to fetch psychologist name parts", currentNamesError));
        }

        updateData.full_name = buildPsychologistFullName(
          input.firstName ?? currentNames?.first_name,
          input.lastName ?? currentNames?.last_name,
        );
      }

      const { error } = await this.supabase
        .from("user_psychologists")
        .update(updateData)
        .eq("id", psychologistId);

      if (error) {
        return err(toInfraError("Failed to update psychologist profile", error));
      }

      return ok(undefined);
    } catch (error) {
      return err(toInfraError("Unexpected error updating psychologist profile", error));
    }
  }

  async updateCredentials(
    psychologistId: string,
    input: UpdatePsychologistCredentialsDTO,
  ): Promise<Result<void, AppError>> {
    try {
      const normalizedCrp = input.crp.trim();
      const normalizedCrpState = input.crpState.trim().toUpperCase();

      if (!CRP_FORMAT_REGEX.test(normalizedCrp)) {
        return err(toValidationError("Invalid CRP format. Use XX/123, XX/123456, or XX/12345-6"));
      }

      if (!VALID_CRP_STATES.has(normalizedCrpState)) {
        return err(toValidationError("Estado inválido"));
      }

      const { error } = await this.supabase
        .from("user_psychologists")
        .update({
          crp: normalizedCrp,
          crp_state: normalizedCrpState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", psychologistId);

      if (error) {
        return err(toInfraError("Failed to update psychologist credentials", error));
      }

      return ok(undefined);
    } catch (error) {
      return err(toInfraError("Unexpected error updating psychologist credentials", error));
    }
  }

  async upsertService(
    psychologistId: string,
    input: UpsertPsychologistServiceDTO,
  ): Promise<Result<{ id: string }, AppError>> {
    try {
      if (input.price < 0) {
        return err(toValidationError("O preço não pode ser negativo"));
      }

      if (input.durationMinutes <= 0) {
        return err(toValidationError("A duração deve ser maior que zero"));
      }

      const { data: catalogService, error: catalogError } = await this.supabase
        .from("reference_values")
        .select("label_pt, metadata")
        .eq("id", input.serviceId)
        .single();

      if (catalogError || !catalogService) {
        return err(toInfraError("Serviço não encontrado no catálogo", catalogError));
      }

      const metadata =
        catalogService.metadata &&
        typeof catalogService.metadata === "object" &&
        !Array.isArray(catalogService.metadata)
          ? (catalogService.metadata as Record<string, unknown>)
          : null;
      const serviceDescription =
        typeof metadata?.description === "string" ? metadata.description : "";

      if (input.id) {
        const { data, error } = await this.supabase
          .from("psychologist_services")
          .update({
            catalog_id: input.serviceId,
            name: catalogService.label_pt,
            price: input.price,
            duration_minutes: input.durationMinutes,
            description: input.notes || serviceDescription,
            is_active: input.isActive ?? true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.id)
          .eq("psychologist_id", psychologistId)
          .select("id")
          .single();

        if (error) {
          return err(toInfraError("Failed to update psychologist service", error));
        }

        return ok({ id: data.id });
      }

      const { data, error } = await this.supabase
        .from("psychologist_services")
        .insert({
          psychologist_id: psychologistId,
          catalog_id: input.serviceId,
          name: catalogService.label_pt,
          price: input.price,
          duration_minutes: input.durationMinutes,
          description: input.notes || serviceDescription,
          is_active: input.isActive ?? true,
        })
        .select("id")
        .single();

      if (error) {
        return err(toInfraError("Failed to create psychologist service", error));
      }

      return ok({ id: data.id });
    } catch (error) {
      return err(toInfraError("Unexpected error saving psychologist service", error));
    }
  }

  async deleteService(psychologistId: string, serviceId: string): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from("psychologist_services")
        .delete()
        .eq("id", serviceId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(toInfraError("Failed to delete psychologist service", error));
      }

      return ok(undefined);
    } catch (error) {
      return err(toInfraError("Unexpected error deleting psychologist service", error));
    }
  }

  async upsertLocation(
    psychologistId: string,
    input: UpsertPsychologistLocationDTO,
  ): Promise<Result<{ id: string }, AppError>> {
    try {
      const locationData = {
        psychologist_id: psychologistId,
        name: input.name,
        street: input.street ?? null,
        number: input.number ?? null,
        complement: input.complement ?? null,
        neighborhood: input.neighborhood ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        postal_code: input.postalCode ?? null,
        is_active: input.isActive ?? true,
        updated_at: new Date().toISOString(),
      };

      if (input.id) {
        const { data, error } = await this.supabase
          .from("public_locations")
          .update(locationData)
          .eq("id", input.id)
          .eq("psychologist_id", psychologistId)
          .select("id")
          .single();

        if (error) {
          return err(toInfraError("Failed to update psychologist location", error));
        }

        return ok({ id: data.id });
      }

      const { data, error } = await this.supabase
        .from("public_locations")
        .insert(locationData)
        .select("id")
        .single();

      if (error) {
        return err(toInfraError("Failed to create psychologist location", error));
      }

      return ok({ id: data.id });
    } catch (error) {
      return err(toInfraError("Unexpected error saving psychologist location", error));
    }
  }

  async deleteLocation(
    psychologistId: string,
    locationId: string,
  ): Promise<Result<void, AppError>> {
    try {
      const { error } = await this.supabase
        .from("public_locations")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", locationId)
        .eq("psychologist_id", psychologistId);

      if (error) {
        return err(toInfraError("Failed to delete psychologist location", error));
      }

      return ok(undefined);
    } catch (error) {
      return err(toInfraError("Unexpected error deleting psychologist location", error));
    }
  }
}
