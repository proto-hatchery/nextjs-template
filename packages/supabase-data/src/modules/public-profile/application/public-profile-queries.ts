import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../lib/errors/app-error";
import { hashPII, serializeError } from "../../../lib/observability/redaction";
import type { Database, Json } from "@workspace/supabase-infra/types/database";
import type {
  CurrentPublicLinksDTO,
  CurrentPublicProfileDTO,
  PublicLinktreeDTO,
} from "../domain/dto/public-profile.dto";
import type { PublicPsychologist } from "@workspace/supabase-data/types/entities";
import { safeLogger } from "../../../utils/safe-logger";
import { PsychologistSupabaseRepository } from "../../psychologists/infrastructure/repositories/psychologist-supabase.repository";

const MAX_REGISTERED_SPECIALTIES = 2;

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function parseStringArray(value: Json | null): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (trimmed.length > 0 && !normalized.includes(trimmed)) {
      normalized.push(trimmed);
    }
  }

  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseNamedArray(value: Json | null): Array<{ id: string; name: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  const parsed: Array<{ id: string; name: string }> = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== "string" || typeof item.name !== "string") {
      continue;
    }

    const normalizedName = item.name.trim();
    if (!normalizedName) continue;
    if (!parsed.some((entry) => entry.id === item.id)) {
      parsed.push({ id: item.id, name: normalizedName });
    }
  }

  return parsed;
}

async function fetchRegisteredSpecialtiesForProfile(
  _supabase: SupabaseClient<Database>,
  _profileId: string,
  fallback: string[] = [],
): Promise<string[]> {
  return fallback.slice(0, MAX_REGISTERED_SPECIALTIES);
}

function toInfraError(message: string, cause?: unknown) {
  return AppError.infra(AppErrorCode.INFRA_SUPABASE, message, cause);
}

export async function getCurrentPublicProfileForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<CurrentPublicProfileDTO | null, AppErrorType>> {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return err(toInfraError("Failed to fetch public profile", error));
  }

  if (!data) {
    return ok(null);
  }

  const registeredSpecialties = await fetchRegisteredSpecialtiesForProfile(
    supabase,
    userId,
    data.registered_specialties ?? [],
  );

  return ok({
    ...data,
    registered_specialties: registeredSpecialties,
  });
}

export async function getCurrentPublicLinksForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Result<CurrentPublicLinksDTO, AppErrorType>> {
  const { data, error } = await supabase
    .from("public_linktree_links")
    .select("*")
    .eq("psychologist_id", userId)
    .order("sort_order", { ascending: true });

  if (error) {
    return err(toInfraError("Failed to fetch public links", error));
  }

  return ok(data ?? []);
}

export function getPublicPsychologistById(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
) {
  return new PsychologistSupabaseRepository(supabase).findById(psychologistId);
}

export function getPublicPsychologistServicesById(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
) {
  return new PsychologistSupabaseRepository(supabase).findServices(psychologistId);
}

export function getPublicPsychologistLocationsById(
  supabase: SupabaseClient<Database>,
  psychologistId: string,
) {
  return new PsychologistSupabaseRepository(supabase).findLocations(psychologistId);
}

export async function getPublicPsychologistBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Result<PublicPsychologist | null, AppErrorType>> {
  const { data: profileData, error: profileError } = await supabase
    .from("public_profiles")
    .select(
      `
      id,
      bio,
      display_name,
      avatar_url,
      background_url,
      slug,
      social_links,
      specialties,
      therapeutic_approaches,
      registered_specialties
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (profileError) {
    safeLogger.error("[public-profile] Failed to fetch profile by slug", {
      slug,
      slugHash: hashPII(slug),
      table: "public_profiles",
      errorCode: extractErrorCode(profileError),
      error: serializeError(profileError),
    });
    return err(toInfraError("Failed to fetch public profile by slug", profileError));
  }

  if (!profileData) {
    return ok(null);
  }

  const psychologistResult = await getPublicPsychologistById(supabase, profileData.id);
  if (psychologistResult.isErr()) {
    return err(psychologistResult.error);
  }

  if (!psychologistResult.value) {
    safeLogger.warn("[public-profile] Missing psychologist row for public profile", {
      slug,
      slugHash: hashPII(slug),
      profileId: profileData.id,
      profileIdHash: hashPII(profileData.id),
      table: "user_psychologists",
    });
    return ok(null);
  }

  const registeredSpecialties = await fetchRegisteredSpecialtiesForProfile(
    supabase,
    profileData.id,
    parseStringArray(profileData.registered_specialties),
  );

  return ok({
    ...psychologistResult.value,
    bio: profileData.bio,
    links: [],
    specialties: parseNamedArray(profileData.specialties),
    therapeutic_approaches: parseNamedArray(profileData.therapeutic_approaches),
    services: [],
    locations: [],
    linktree_links: [],
    linktree_display_name: profileData.display_name,
    linktree_avatar_url: profileData.avatar_url,
    linktree_background_url: profileData.background_url,
    linktree_slug: profileData.slug,
    linktree_theme: null,
    linktree_avatar_path: null,
    linktree_background_path: null,
    social_links: profileData.social_links,
    registered_specialties: registeredSpecialties,
  });
}

export async function getPublicLinktreeBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<Result<PublicLinktreeDTO | null, AppErrorType>> {
  const { data: profileData, error: profileError } = await supabase
    .from("public_profiles")
    .select(
      `
      id,
      display_name,
      avatar_url,
      background_url,
      slug,
      social_links,
      linktree_theme,
      avatar_path,
      background_path,
      bio
    `,
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (profileError) {
    return err(toInfraError("Failed to fetch public linktree profile", profileError));
  }

  if (!profileData) {
    return ok(null);
  }

  const psychologistResult = await getPublicPsychologistById(supabase, profileData.id);
  if (psychologistResult.isErr()) {
    return err(psychologistResult.error);
  }

  if (!psychologistResult.value) {
    return ok(null);
  }

  const linksResult = await getCurrentPublicLinksForUser(supabase, profileData.id);
  if (linksResult.isErr()) {
    return err(linksResult.error);
  }

  return ok({
    display_name: profileData.display_name,
    avatar_url: profileData.avatar_url,
    background_url: profileData.background_url,
    slug: profileData.slug,
    social_links: profileData.social_links,
    linktree_theme: profileData.linktree_theme,
    avatar_path: profileData.avatar_path,
    background_path: profileData.background_path,
    full_name: psychologistResult.value.full_name ?? null,
    bio: profileData.bio,
    linktree_links: linksResult.value.filter((link) => link.is_active),
  });
}
