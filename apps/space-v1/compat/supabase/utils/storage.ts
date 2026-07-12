"use client";

import { createBrowserAuthClient } from "@workspace/supabase-auth/browser/create-browser-auth-client";
import { safeLogger } from "./safe-logger";

/**
 * Uploads a base64 image string to Supabase Storage.
 * @param bucket The storage bucket name.
 * @param path The path within the bucket (e.g., 'avatars/user-id.png').
 * @param base64String The base64 encoded image string.
 * @returns The public URL of the uploaded image.
 */
export async function uploadBase64Image(
  bucket: string,
  path: string,
  base64String: string,
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createBrowserAuthClient();

    // Convert base64 to Blob
    const base64Data = base64String.split(",")[1];
    if (!base64Data) {
      return { url: null, error: "Invalid base64 string" };
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: "image/png",
      upsert: true,
    });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err) {
    safeLogger.error("[uploadBase64Image] Unexpected error:", err);
    return { url: null, error: "Erro inesperado ao fazer upload da imagem." };
  }
}

export async function uploadBase64ImageWithPath(
  bucket: string,
  path: string,
  base64String: string,
): Promise<{ url: string | null; path: string | null; error: string | null }> {
  try {
    const supabase = createBrowserAuthClient();

    const base64Data = base64String.split(",")[1];
    if (!base64Data) {
      return { url: null, path: null, error: "Invalid base64 string" };
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    const { data, error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: "image/png",
      upsert: true,
    });

    if (uploadError || !data?.path) {
      return { url: null, path: null, error: uploadError?.message ?? "Upload falhou" };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, path: data.path, error: null };
  } catch (err) {
    safeLogger.error("[uploadBase64ImageWithPath] Unexpected error:", err);
    return { url: null, path: null, error: "Erro inesperado ao fazer upload da imagem." };
  }
}

export function getPublicStorageUrl(bucket: string, path: string | null): string | null {
  if (!path) return null;
  try {
    const supabase = createBrowserAuthClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl || null;
  } catch (err) {
    safeLogger.error("[getPublicStorageUrl] Unexpected error:", err);
    return null;
  }
}

export async function getSignedStorageUrl(
  bucket: string,
  path: string | null,
  expiresInSeconds = 300,
): Promise<{ url: string | null; error: string | null }> {
  if (!path) return { url: null, error: "Path inválido para gerar URL assinada." };

  try {
    const supabase = createBrowserAuthClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return { url: null, error: error?.message ?? "Não foi possível gerar a URL assinada." };
    }

    return { url: data.signedUrl, error: null };
  } catch (err) {
    safeLogger.error("[getSignedStorageUrl] Unexpected error:", err);
    return { url: null, error: "Erro inesperado ao gerar a URL assinada." };
  }
}

export async function downloadAndOpenSignedStorageObject(
  bucket: string,
  path: string | null,
  options?: {
    expiresInSeconds?: number;
    fileName?: string;
    openInNewTab?: boolean;
  },
): Promise<{ error: string | null }> {
  if (!path) return { error: "Path inválido para download." };

  try {
    const { url, error } = await getSignedStorageUrl(
      bucket,
      path,
      options?.expiresInSeconds ?? 300,
    );
    if (error || !url) {
      return { error: error ?? "Não foi possível gerar o link do arquivo." };
    }

    const response = await fetch(url);
    if (!response.ok) {
      return { error: "Não foi possível baixar o arquivo." };
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const fileName = options?.fileName ?? path.split("/").pop() ?? "arquivo.pdf";

    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();

    if (options?.openInNewTab ?? true) {
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return { error: null };
  } catch (err) {
    safeLogger.error("[downloadAndOpenSignedStorageObject] Unexpected error:", err);
    return { error: "Erro inesperado ao baixar o arquivo." };
  }
}

export async function deleteStorageObject(
  bucket: string,
  path: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createBrowserAuthClient();
    if (!path) {
      return { success: false, error: "Path inválido para deletar." };
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    safeLogger.error("[deleteStorageObject] Unexpected error:", err);
    return { success: false, error: "Erro inesperado ao deletar a imagem." };
  }
}

export async function deleteStorageObjectByUrl(
  bucket: string,
  publicUrl: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createBrowserAuthClient();
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = publicUrl.indexOf(marker);
    if (markerIndex === -1) {
      return { success: false, error: "URL não pertence ao bucket informado." };
    }

    const path = publicUrl.slice(markerIndex + marker.length);
    if (!path) {
      return { success: false, error: "Path inválido para deletar." };
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    safeLogger.error("[deleteStorageObjectByUrl] Unexpected error:", err);
    return { success: false, error: "Erro inesperado ao deletar a imagem." };
  }
}
