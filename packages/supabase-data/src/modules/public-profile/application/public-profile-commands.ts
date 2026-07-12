import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../lib/errors/app-error";
import { hashPII, serializeError } from "../../../lib/observability/redaction";
import { emitEvent } from "../../../lib/observability/storage";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  CheckPublicProfileSlugResultDTO,
  PublicProfileImageUploadDTO,
  PublicProfileMutationResultDTO,
  SyncPublicProfileLinksInputDTO,
  UpdatePublicProfileInputDTO,
  UpdatePublicSiteSettingsInputDTO,
} from "../domain/dto/public-profile.dto";
import { safeLogger } from "../../../utils/safe-logger";
import {
  type PublicProfileImageKind,
  uploadPublicProfileImage,
} from "../infrastructure/storage/public-profile-image.storage";

const MAX_REGISTERED_SPECIALTIES = 2;
const UPDATE_PROFILE_OPERATION = "update_public_profile_data";
const UPDATE_PROFILE_COMPONENT = "public-profile.update_profile_data";
const SLUG_MAX_LENGTH = 30;
const SLUG_MIN_LENGTH = 3;

function successResult(): PublicProfileMutationResultDTO {
  return { success: true };
}

function toInfraError(message: string, cause?: unknown) {
  return AppError.infra(AppErrorCode.INFRA_SUPABASE, message, cause);
}

function toValidationError(message: string) {
  return AppError.validation(AppErrorCode.VALIDATION_INVALID_INPUT, message);
}

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function normalizeRegisteredSpecialties(raw: string[]): string[] {
  const normalized = raw.map((item) => item.trim()).filter((item) => item.length > 0);
  const deduplicated: string[] = [];
  for (const item of normalized) {
    if (!deduplicated.includes(item)) {
      deduplicated.push(item);
    }
  }
  return deduplicated;
}

async function emitProfileUpdateEvent(params: {
  eventName: string;
  outcome: "success" | "failure" | "error";
  userId: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
  errorCode?: string;
}): Promise<void> {
  try {
    await emitEvent({
      event_family: "operational",
      event_name: params.eventName,
      component: UPDATE_PROFILE_COMPONENT,
      actor_type: "authenticated",
      actor_id_hash: hashPII(params.userId),
      operation: UPDATE_PROFILE_OPERATION,
      operation_type: "mutation",
      outcome: params.outcome,
      ...(params.errorCode !== undefined ? { error_code: params.errorCode } : {}),
      ...(params.error ? { error_message: serializeError(params.error) } : {}),
      ...(params.metadata !== undefined ? { metadata: params.metadata } : {}),
    });
  } catch (emitError) {
    safeLogger.warn("[public-profile] Failed to emit unified event", {
      userId: params.userId,
      userIdHash: hashPII(params.userId),
      eventName: params.eventName,
      emitError: serializeError(emitError),
    });
  }
}

const normalizeText = (value?: string | null): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeSlug = (value?: string | null): string | null => {
  const trimmed = normalizeText(value);
  if (!trimmed) return null;

  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const validateSlug = (normalizedSlug: string | null): { valid: boolean; error?: string } => {
  if (!normalizedSlug) {
    return { valid: false, error: "Slug é obrigatório" };
  }

  if (normalizedSlug.length < SLUG_MIN_LENGTH) {
    return { valid: false, error: `Slug deve ter pelo menos ${SLUG_MIN_LENGTH} caracteres` };
  }

  if (normalizedSlug.length > SLUG_MAX_LENGTH) {
    return { valid: false, error: `Slug deve ter no máximo ${SLUG_MAX_LENGTH} caracteres` };
  }

  return { valid: true };
};

const sanitizeSocialLinks = (links?: Record<string, string | undefined | null> | null) => {
  if (!links) return null;
  const entries = Object.entries(links)
    .map(([key, value]) => [key, value?.trim() ?? ""] as const)
    .filter((entry) => entry[1].length > 0);

  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export async function updatePublicProfileForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: UpdatePublicProfileInputDTO,
): Promise<Result<PublicProfileMutationResultDTO, AppErrorType>> {
  const requestedFieldKeys = Object.keys(input);

  try {
    const normalizedRegisteredSpecialties =
      input.registered_specialties !== undefined
        ? normalizeRegisteredSpecialties(input.registered_specialties)
        : undefined;

    if (
      normalizedRegisteredSpecialties !== undefined &&
      normalizedRegisteredSpecialties.length > MAX_REGISTERED_SPECIALTIES
    ) {
      await emitProfileUpdateEvent({
        eventName: "public_profile_update_validation_failed",
        outcome: "failure",
        userId,
        metadata: {
          attempted_fields: requestedFieldKeys,
          registered_specialties_count: normalizedRegisteredSpecialties.length,
          max_allowed_registered_specialties: MAX_REGISTERED_SPECIALTIES,
        },
      });

      return err(toValidationError("Máximo de 2 especialidades registradas."));
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.display_name !== undefined) updateData.display_name = input.display_name;
    if (input.tagline !== undefined) updateData.tagline = input.tagline;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url;
    if (input.avatar_path !== undefined) updateData.avatar_path = input.avatar_path;
    if (input.background_url !== undefined) updateData.background_url = input.background_url;
    if (input.background_path !== undefined) updateData.background_path = input.background_path;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.languages !== undefined) updateData.languages = input.languages;
    if (input.specialties !== undefined) updateData.specialties = input.specialties;
    if (input.therapeutic_approaches !== undefined) {
      updateData.therapeutic_approaches = input.therapeutic_approaches;
    }
    if (input.academic_timeline !== undefined)
      updateData.academic_timeline = input.academic_timeline;
    if (input.professional_timeline !== undefined) {
      updateData.professional_timeline = input.professional_timeline;
    }
    if (normalizedRegisteredSpecialties !== undefined) {
      updateData.registered_specialties = normalizedRegisteredSpecialties;
    }
    if (input.gallery_photos !== undefined) updateData.gallery_photos = input.gallery_photos;
    if (input.is_public !== undefined) updateData.is_public = input.is_public;
    if (input.show_in_marketplace !== undefined) {
      updateData.show_in_marketplace = input.show_in_marketplace;
    }
    if (input.profile_sections !== undefined) updateData.profile_sections = input.profile_sections;
    if (input.video_section !== undefined) updateData.video_section = input.video_section;

    const updateFieldKeys = Object.keys(updateData).filter((key) => key !== "updated_at");

    const { error } = await supabase.from("public_profiles").update(updateData).eq("id", userId);
    if (error) {
      const errorCode = extractErrorCode(error);
      await emitProfileUpdateEvent({
        eventName: "public_profile_update_failed",
        outcome: "error",
        userId,
        error,
        ...(errorCode ? { errorCode } : {}),
        metadata: {
          attempted_fields: updateFieldKeys,
          table: "public_profiles",
        },
      });
      return err(toInfraError("Erro ao atualizar perfil. Tente novamente.", error));
    }

    await emitProfileUpdateEvent({
      eventName: "public_profile_updated",
      outcome: "success",
      userId,
      metadata: {
        updated_fields: updateFieldKeys,
        ranked_specialties_updated: normalizedRegisteredSpecialties !== undefined,
        ranked_specialties_count: normalizedRegisteredSpecialties?.length ?? null,
      },
    });

    return ok(successResult());
  } catch (error) {
    return err(toInfraError("Erro ao atualizar perfil. Tente novamente.", error));
  }
}

export async function updatePublicSiteSettingsForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: UpdatePublicSiteSettingsInputDTO,
): Promise<Result<PublicProfileMutationResultDTO, AppErrorType>> {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.displayName !== undefined) updateData.display_name = normalizeText(input.displayName);
    if (input.tagline !== undefined) updateData.tagline = normalizeText(input.tagline);
    if (input.bio !== undefined) updateData.bio = normalizeText(input.bio);
    if (input.avatarUrl !== undefined) updateData.avatar_url = normalizeText(input.avatarUrl);
    if (input.avatarPath !== undefined) updateData.avatar_path = normalizeText(input.avatarPath);
    if (input.backgroundUrl !== undefined) {
      updateData.background_url = normalizeText(input.backgroundUrl);
    }
    if (input.backgroundPath !== undefined) {
      updateData.background_path = normalizeText(input.backgroundPath);
    }
    if (input.linktreeTheme !== undefined) {
      updateData.linktree_theme = normalizeText(input.linktreeTheme);
    }
    if (input.socialLinks !== undefined) {
      updateData.social_links = sanitizeSocialLinks(
        input.socialLinks as Record<string, string | undefined | null> | null,
      );
    }
    if (input.isPublic !== undefined) updateData.is_public = input.isPublic;
    if (input.showInMarketplace !== undefined) {
      updateData.show_in_marketplace = input.showInMarketplace;
    }
    if (input.acceptingNewPatients !== undefined) {
      updateData.accepting_new_patients = input.acceptingNewPatients;
    }
    if (input.specialties !== undefined) updateData.specialties = input.specialties;
    if (input.therapeuticApproaches !== undefined) {
      updateData.therapeutic_approaches = input.therapeuticApproaches;
    }
    if (input.academicTimeline !== undefined) {
      updateData.academic_timeline = input.academicTimeline;
    }
    if (input.professionalTimeline !== undefined) {
      updateData.professional_timeline = input.professionalTimeline;
    }

    if (input.usernameSlug !== undefined) {
      const usernameSlug = normalizeSlug(input.usernameSlug);
      if (usernameSlug) {
        const validation = validateSlug(usernameSlug);
        if (!validation.valid) {
          return err(toValidationError(validation.error ?? "Slug inválido"));
        }

        const { data: existingProfiles, error: profileSlugError } = await supabase
          .from("public_profiles")
          .select("id")
          .eq("slug", usernameSlug)
          .neq("id", userId)
          .limit(1);

        if (profileSlugError) {
          return err(toInfraError("Erro ao verificar disponibilidade da URL.", profileSlugError));
        }

        if ((existingProfiles ?? []).length > 0) {
          return err(toValidationError("Essa URL já está em uso"));
        }
      }

      updateData.slug = usernameSlug;
    }

    const { error } = await supabase.from("public_profiles").upsert(
      {
        id: userId,
        ...updateData,
      },
      { onConflict: "id" },
    );

    if (error) {
      return err(toInfraError("Erro ao atualizar o site público. Tente novamente.", error));
    }

    return ok(successResult());
  } catch (error) {
    return err(toInfraError("Erro ao atualizar o site público. Tente novamente.", error));
  }
}

export async function checkPublicProfileSlugAvailabilityForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  usernameSlug: string,
): Promise<Result<CheckPublicProfileSlugResultDTO, AppErrorType>> {
  const normalized = normalizeText(usernameSlug);
  const normalizedSlug = normalizeSlug(normalized);

  if (!normalizedSlug) {
    return ok({ available: false });
  }

  const validation = validateSlug(normalizedSlug);
  if (!validation.valid) {
    return ok({ available: false });
  }

  const { data, error } = await supabase
    .from("public_profiles")
    .select("id")
    .eq("slug", normalizedSlug)
    .neq("id", userId)
    .limit(1);

  if (error) {
    return err(toInfraError("Erro ao verificar disponibilidade. Tente novamente.", error));
  }

  return ok({ available: (data ?? []).length === 0 });
}

export async function syncPublicProfileLinksForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: SyncPublicProfileLinksInputDTO,
): Promise<Result<PublicProfileMutationResultDTO, AppErrorType>> {
  const links = input.links ?? [];

  const { data: existingLinks, error: existingError } = await supabase
    .from("public_linktree_links")
    .select("id")
    .eq("psychologist_id", userId);

  if (existingError) {
    return err(toInfraError("Erro ao carregar links públicos.", existingError));
  }

  const existingIds = new Set((existingLinks ?? []).map((link) => link.id));
  const incomingIds = new Set(links.map((link) => link.id));
  const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("public_linktree_links")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      return err(toInfraError("Erro ao remover links públicos.", deleteError));
    }
  }

  if (links.length === 0) {
    return ok(successResult());
  }

  const now = new Date().toISOString();
  const upsertData = links.map((link, index) => ({
    id: link.id,
    psychologist_id: userId,
    title: link.title?.trim() || "",
    url: link.url?.trim() || "",
    is_active: link.isActive ?? true,
    sort_order: link.sortOrder ?? index,
    updated_at: now,
  }));

  const { error: upsertError } = await supabase
    .from("public_linktree_links")
    .upsert(upsertData, { onConflict: "id" });

  if (upsertError) {
    return err(toInfraError("Erro ao salvar links públicos.", upsertError));
  }

  return ok(successResult());
}

export function uploadPublicProfileImageForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  kind: PublicProfileImageKind,
  croppedImage: string,
  previousUrl?: string,
  previousPath?: string,
): Promise<Result<PublicProfileImageUploadDTO, AppErrorType>> {
  return uploadPublicProfileImage(supabase, userId, kind, croppedImage, previousUrl, previousPath);
}
