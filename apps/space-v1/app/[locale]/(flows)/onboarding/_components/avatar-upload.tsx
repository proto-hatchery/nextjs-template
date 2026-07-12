"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
} from "@workspace/brand/patterns/kibo-ui/image-crop";
import { UserCircle, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  useOnboardingAvatarUpload,
  validateOnboardingAvatarFile,
} from "../_hooks/use-onboarding-avatar-upload";

interface AvatarUploadProps {
  avatarUrl: string | undefined;
  avatarPath: string | undefined;
  onChange: (url: string | undefined, path: string | undefined) => void;
  disabled?: boolean;
}

export function AvatarUpload({ avatarUrl, avatarPath, onChange, disabled }: AvatarUploadProps) {
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isUploading,
    uploadError,
    clearUploadError,
    reportUploadError,
    uploadCroppedAvatar,
    removeAvatar,
  } = useOnboardingAvatarUpload({
    avatarUrl,
    avatarPath,
    onUploaded: onChange,
    onRemoved: () => onChange(undefined, undefined),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateOnboardingAvatarFile(file);
    if (validationError) {
      reportUploadError(validationError);
      return;
    }

    clearUploadError();
    setCropFile(file);
    setIsCropping(true);
  };

  const handleCropComplete = async (croppedImage: string) => {
    const didUpload = await uploadCroppedAvatar(croppedImage);
    if (didUpload) {
      setIsCropping(false);
      setCropFile(null);
    }
  };

  const handleRemove = () => {
    void removeAvatar();
  };

  const handleCancelCrop = () => {
    clearUploadError();
    setIsCropping(false);
    setCropFile(null);
  };

  // Modo de crop
  if (isCropping && cropFile) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-full max-w-[280px] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 p-3">
          <ImageCrop
            file={cropFile}
            aspect={1}
            onCrop={(img: string) => {
              void handleCropComplete(img);
            }}
          >
            <ImageCropContent className="max-h-[240px] w-full object-contain" />
            <div className="mt-3 flex justify-between gap-2">
              <BrandButton
                type="button"
                variant="ghost"
                onClick={handleCancelCrop}
                disabled={isUploading}
                size="small"
                className="flex-1"
              >
                Cancelar
              </BrandButton>
              <ImageCropApply
                type="button"
                variant="secondary"
                size="default"
                disabled={isUploading}
                className="flex-1 rounded-full h-9 text-sm font-semibold"
              >
                {isUploading ? "Salvando..." : "Salvar foto"}
              </ImageCropApply>
            </div>
          </ImageCrop>
        </div>
        <p className="text-xs text-zinc-400 text-center">Arraste para ajustar o enquadramento</p>
      </div>
    );
  }

  // Modo normal
  return (
    <div className="flex flex-col items-center gap-3 pt-1">
      {/* Input file escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {/* Avatar Preview - Clicável */}
      <div className="relative group">
        <BrandButton
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={Boolean(disabled) || isUploading}
          className="relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-4 focus-visible:ring-offset-white disabled:opacity-50 transition-all h-auto w-auto p-0"
        >
          <Avatar className="size-24 border-4 border-white shadow-lg group-hover:brightness-90 transition-all">
            <AvatarImage src={avatarUrl} alt="Foto de perfil" className="object-cover" />
            <AvatarFallback className="text-2xl text-zinc-400 bg-zinc-50">
              <UserCircle className="size-12" />
            </AvatarFallback>
          </Avatar>

          {/* Overlay com ícone de câmera no hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <svg
              className="size-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </BrandButton>

        {/* Botão remover (aparece quando tem foto) */}
        {avatarUrl && (
          <BrandButton
            type="button"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={Boolean(disabled) || isUploading}
            variant="neutral"
            size="icon-sm"
            className="absolute bottom-1 right-1 size-6 rounded-full border border-zinc-200"
            aria-label="Remover foto"
          >
            <X className="size-3" />
          </BrandButton>
        )}
      </div>

      {/* Hint text */}
      <p className="text-[10px] text-zinc-400 font-medium text-center">
        Clique para {avatarUrl ? "alterar" : "adicionar"} foto
      </p>

      {/* Mensagem de erro */}
      {uploadError && <p className="text-xs text-red-500 text-center">{uploadError}</p>}
    </div>
  );
}
