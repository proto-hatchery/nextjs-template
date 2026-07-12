import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";

const PROFILES_BUCKET = "profiles";
const AVATAR_FOLDER = "avatar";

export interface OnboardingAvatarUploadDTO {
  url: string;
  path: string;
}

function extractBucketPathFromPublicUrl(bucket: string, publicUrl?: string): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  const path = publicUrl.slice(markerIndex + marker.length);
  return path || null;
}

function isOwnedAvatarPath(userId: string, path?: string | null): path is string {
  if (!path) return false;
  return path.startsWith(`${userId}/${AVATAR_FOLDER}/`);
}

async function deletePreviousAvatar(
  supabase: SupabaseClient<Database>,
  userId: string,
  previousPath: string | undefined,
  previousUrl: string | undefined,
): Promise<void> {
  if (isOwnedAvatarPath(userId, previousPath)) {
    await supabase.storage.from(PROFILES_BUCKET).remove([previousPath]);
    return;
  }

  const extractedPath = extractBucketPathFromPublicUrl(PROFILES_BUCKET, previousUrl);
  if (isOwnedAvatarPath(userId, extractedPath)) {
    await supabase.storage.from(PROFILES_BUCKET).remove([extractedPath]);
  }
}

export async function uploadOnboardingAvatar(
  supabase: SupabaseClient<Database>,
  userId: string,
  croppedImage: string,
  previousUrl?: string,
  previousPath?: string,
): Promise<Result<OnboardingAvatarUploadDTO, AppErrorType>> {
  await deletePreviousAvatar(supabase, userId, previousPath, previousUrl);

  const base64Data = croppedImage.split(",")[1];
  if (!base64Data) {
    return err(AppError.validation(AppErrorCode.VALIDATION_INVALID_FORMAT, "Imagem inválida"));
  }

  const buffer = Buffer.from(base64Data, "base64");
  const uploadPath = `${userId}/${AVATAR_FOLDER}/${Date.now()}.png`;

  const { data, error } = await supabase.storage.from(PROFILES_BUCKET).upload(uploadPath, buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (error || !data?.path) {
    return err(
      AppError.infra(AppErrorCode.INFRA_SUPABASE, error?.message ?? "Falha ao fazer upload", error),
    );
  }

  const { data: publicUrlData } = supabase.storage.from(PROFILES_BUCKET).getPublicUrl(data.path);
  if (!publicUrlData.publicUrl) {
    return err(AppError.infra(AppErrorCode.INFRA_SUPABASE, "Falha ao gerar URL da imagem"));
  }

  return ok({ url: publicUrlData.publicUrl, path: data.path });
}

export async function removeOnboardingAvatar(
  supabase: SupabaseClient<Database>,
  userId: string,
  previousUrl?: string,
  previousPath?: string,
): Promise<Result<{ success: true }, AppErrorType>> {
  await deletePreviousAvatar(supabase, userId, previousPath, previousUrl);
  return ok({ success: true });
}
