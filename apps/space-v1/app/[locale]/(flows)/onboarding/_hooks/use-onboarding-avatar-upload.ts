"use client";

import {
  removeOnboardingAvatarAction,
  uploadOnboardingAvatarAction,
} from "@workspace/supabase-data/actions/onboarding/upload-avatar";
import { useCallback, useState } from "react";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateOnboardingAvatarFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPEG, PNG ou WebP.";
  }

  const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`;
  }

  return null;
}

interface UseOnboardingAvatarUploadParams {
  avatarUrl: string | undefined;
  avatarPath: string | undefined;
  onUploaded: (url: string | undefined, path: string | undefined) => void;
  onRemoved: () => void;
}

export function useOnboardingAvatarUpload({
  avatarUrl,
  avatarPath,
  onUploaded,
  onRemoved,
}: UseOnboardingAvatarUploadParams) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  const reportUploadError = useCallback((message: string) => {
    setUploadError(message);
  }, []);

  const uploadCroppedAvatar = useCallback(
    async (croppedImage: string) => {
      setIsUploading(true);

      try {
        const result = await uploadOnboardingAvatarAction({
          croppedImage,
          previousUrl: avatarUrl,
          previousPath: avatarPath,
        });
        if (!result.success || !result.data.url) {
          setUploadError(
            result.success ? "Falha ao fazer upload da imagem." : result.error.message,
          );
          return false;
        }

        onUploaded(result.data.url, result.data.path);
        setUploadError(null);
        return true;
      } catch (ignoreError) {
        setUploadError("Erro inesperado ao salvar imagem.");
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [avatarPath, avatarUrl, onUploaded],
  );

  const removeAvatar = useCallback(async () => {
    try {
      const result = await removeOnboardingAvatarAction({
        previousUrl: avatarUrl,
        previousPath: avatarPath,
      });
      if (!result.success) {
        setUploadError(result.error.message);
        return;
      }
      onRemoved();
      setUploadError(null);
    } catch (ignoreError) {
      setUploadError("Erro inesperado ao remover imagem.");
    }
  }, [avatarPath, avatarUrl, onRemoved]);

  return {
    isUploading,
    uploadError,
    clearUploadError,
    reportUploadError,
    uploadCroppedAvatar,
    removeAvatar,
  };
}
