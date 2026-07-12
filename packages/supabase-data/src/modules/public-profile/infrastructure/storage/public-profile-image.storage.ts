import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import {
  AppError,
  AppErrorCode,
  type AppError as AppErrorType,
} from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type { PublicProfileImageUploadDTO } from "../../domain/dto/public-profile.dto";
import { safeLogger } from "../../../../utils/safe-logger";

const PRIMARY_STORAGE_BUCKET = "profiles";
const LEGACY_STORAGE_BUCKET = "linktree";
const STORAGE_BUCKETS = [PRIMARY_STORAGE_BUCKET, LEGACY_STORAGE_BUCKET] as const;

export type PublicProfileImageKind = "avatar" | "background";

function toInfraError(message: string, cause?: unknown) {
  return AppError.infra(AppErrorCode.INFRA_STORAGE, message, cause);
}

function getPathFromPublicStorageUrl(publicUrl: string): { bucket: string; path: string } | null {
  const marker = "/storage/v1/object/public/";
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  const afterMarker = publicUrl.slice(markerIndex + marker.length);
  const [bucket, ...rest] = afterMarker.split("/");
  const path = rest.join("/");

  if (!bucket || !path) return null;
  return { bucket, path };
}

async function tryDeletePreviousImage(
  supabase: SupabaseClient<Database>,
  previousPath?: string,
  previousUrl?: string,
): Promise<void> {
  try {
    if (previousPath) {
      for (const bucket of STORAGE_BUCKETS) {
        const { error } = await supabase.storage.from(bucket).remove([previousPath]);
        if (!error) return;
      }
      return;
    }

    if (!previousUrl) return;
    const parsed = getPathFromPublicStorageUrl(previousUrl);
    if (!parsed) return;

    const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
    if (error) {
      safeLogger.warn("[public-profile] Non-blocking previous image delete warning", {
        bucket: parsed.bucket,
        path: parsed.path,
        message: error.message,
      });
    }
  } catch (error) {
    safeLogger.warn("[public-profile] Non-blocking previous image delete exception", error);
  }
}

export async function uploadPublicProfileImage(
  supabase: SupabaseClient<Database>,
  userId: string,
  kind: PublicProfileImageKind,
  croppedImage: string,
  previousUrl?: string,
  previousPath?: string,
): Promise<Result<PublicProfileImageUploadDTO, AppErrorType>> {
  const base64Data = croppedImage.split(",")[1];
  if (!base64Data) {
    return err(AppError.validation(AppErrorCode.VALIDATION_INVALID_FORMAT, "Imagem inválida"));
  }

  await tryDeletePreviousImage(supabase, previousPath, previousUrl);

  const buffer = Buffer.from(base64Data, "base64");
  const uploadPath = `${userId}/linktree/${kind}/${Date.now()}.png`;

  for (const bucket of STORAGE_BUCKETS) {
    const { data, error } = await supabase.storage.from(bucket).upload(uploadPath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

    if (error || !data?.path) {
      continue;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    if (!publicUrlData.publicUrl) {
      continue;
    }

    return ok({
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  }

  return err(toInfraError("Falha ao fazer upload da imagem"));
}
