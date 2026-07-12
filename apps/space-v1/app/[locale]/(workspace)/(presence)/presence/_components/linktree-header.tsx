"use client";

import {
  RiCloseLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiSpotifyLine,
  RiTiktokLine,
  RiTwitterXLine,
  RiYoutubeLine,
} from "@remixicon/react";
import { deleteStorageObject, deleteStorageObjectByUrl } from "@/compat/supabase/utils/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriFormDialogFooter,
  FluriFormDialogShell,
} from "@workspace/brand/overlays/fluri-form-dialog-shell";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
} from "@workspace/brand/patterns/kibo-ui/image-crop";
import { Plus } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useRef, useState } from "react";

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  spotify?: string;
  linkedin?: string;
}

interface LinktreeHeaderProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  tagline: string;
  setTagline: (val: string) => void;
  /** Linktree slug: public URL segment (e.g.: me.fluri.com.br/[slug]) */
  linktreeSlug: string;
  setLinktreeSlug: (val: string) => void;
  onSlugBlur?: () => void;
  slugError?: string | null;
  isCheckingSlug?: boolean;
  avatarUrl?: string;
  setAvatarUrl: (val: string | undefined) => void;
  avatarPath?: string;
  setAvatarPath: (val: string | undefined) => void;
  backgroundImageUrl?: string;
  setBackgroundImageUrl?: (val: string | undefined) => void;
  backgroundImagePath?: string;
  setBackgroundImagePath?: (val: string | undefined) => void;
  socials: SocialLinks;
  setSocials: (socials: SocialLinks) => void;
  /** Callback for avatar upload - receives cropped base64 image, returns url and path */
  onAvatarUpload?: (croppedImage: string) => Promise<{ url: string; path?: string } | null>;
  /** Callback for background upload - receives cropped base64 image, returns url and path */
  onBackgroundUpload?: (croppedImage: string) => Promise<{ url: string; path?: string } | null>;
}

export function LinktreeHeader({
  displayName,
  setDisplayName,
  tagline,
  setTagline,
  linktreeSlug,
  setLinktreeSlug,
  onSlugBlur,
  slugError,
  isCheckingSlug,
  avatarUrl,
  setAvatarUrl,
  avatarPath: _avatarPath,
  setAvatarPath,
  backgroundImageUrl,
  setBackgroundImageUrl,
  backgroundImagePath,
  setBackgroundImagePath,
  socials,
  setSocials,
  onAvatarUpload,
  onBackgroundUpload,
}: LinktreeHeaderProps) {
  const uploadBucket = "profiles";
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<keyof SocialLinks | null>(null);
  const [tempSocialValue, setTempSocialValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<{ file: File; type: "avatar" | "background" } | null>(
    null,
  );

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const cropAppliedRef = useRef(false);

  const openSocialModal = (platform: keyof SocialLinks) => {
    setActiveSocialPlatform(platform);
    setTempSocialValue(socials[platform] ?? "");
    setIsSocialModalOpen(true);
  };

  const handleAddSocial = () => {
    if (activeSocialPlatform) {
      setSocials({ ...socials, [activeSocialPlatform]: tempSocialValue });
    }
    setIsSocialModalOpen(false);
  };

  const removeSocial = (platform: keyof SocialLinks) => {
    const newSocials = { ...socials };
    delete newSocials[platform];
    setSocials(newSocials);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "background",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMb = type === "avatar" ? 5 : 10;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Formato inválido. Use JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > maxSizeBytes) {
      setUploadError(`Arquivo muito grande. Máximo ${maxSizeMb}MB.`);
      return;
    }

    setUploadError(null);
    cropAppliedRef.current = false;
    setCropFile({ file, type });
  };

  const handleCropComplete = async (croppedImage: string) => {
    if (!cropFile) return;
    if (cropAppliedRef.current) return;
    cropAppliedRef.current = true;

    const uploadCallback = cropFile.type === "avatar" ? onAvatarUpload : onBackgroundUpload;
    if (!uploadCallback) {
      setUploadError("Upload não configurado.");
      cropAppliedRef.current = false;
      return;
    }

    setIsUploading(true);
    let didUpload = false;
    try {
      const result = await uploadCallback(croppedImage);
      if (!result) {
        setUploadError("Falha ao fazer upload da imagem.");
        return;
      }

      const { url, path } = result;
      if (cropFile.type === "avatar") {
        setAvatarUrl(url);
        setAvatarPath(path ?? undefined);
      } else {
        setBackgroundImageUrl?.(url);
        setBackgroundImagePath?.(path ?? undefined);
      }
      didUpload = true;
    } catch (ignoreErr) {
      setUploadError("Erro inesperado ao salvar imagem.");
    } finally {
      setIsUploading(false);
      if (didUpload) {
        setCropFile(null);
      } else {
        cropAppliedRef.current = false;
      }
    }
  };

  const formatPlatformName = (platform: string | null) => {
    if (!platform) return "";
    if (platform === "twitter") return "Twitter (atual X)";
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <>
      <section className="flex flex-row space-x-3 items-center justify-between border-b border-solid border-[#E0E2D9] mx-[-1em] px-4 pb-6 md:border-none md:mx-0 md:px-0 md:pb-0 mb-6">
        <div className="relative min-w-[64px] max-w-[64px] rounded-full overflow-visible flex">
          <div
            onClick={() => setIsAppearanceModalOpen(true)}
            className="size-16 rounded-full overflow-hidden border border-solid border-zinc-200 cursor-pointer hover:brightness-90 transition-all flex items-center justify-center bg-zinc-100"
          >
            <Avatar className="size-full rounded-full">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-zinc-100 text-zinc-400 flex items-center justify-center">
                <Plus className="size-6" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex flex-col gap-4 grow min-w-0 ml-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-left">
                <a
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-black leading-tight cursor-pointer text-ellipsis overflow-hidden font-semibold text-base hover:underline transition-all active:opacity-70"
                >
                  {displayName || "Seu nome"}
                </a>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              <SocialBadge
                onClick={() => openSocialModal("instagram")}
                onRemove={() => removeSocial("instagram")}
                icon={<RiInstagramLine className="size-6 text-[#757575]" />}
                hasValue={!!socials.instagram}
              />
              <SocialBadge
                onClick={() => openSocialModal("tiktok")}
                onRemove={() => removeSocial("tiktok")}
                icon={<RiTiktokLine className="size-6 text-[#757575]" />}
                hasValue={!!socials.tiktok}
              />
              <SocialBadge
                onClick={() => openSocialModal("youtube")}
                onRemove={() => removeSocial("youtube")}
                icon={<RiYoutubeLine className="size-6 text-[#757575]" />}
                hasValue={!!socials.youtube}
              />
              <SocialBadge
                onClick={() => openSocialModal("twitter")}
                onRemove={() => removeSocial("twitter")}
                icon={<RiTwitterXLine className="size-6 text-[#757575]" />}
                hasValue={!!socials.twitter}
              />
              <SocialBadge
                onClick={() => openSocialModal("spotify")}
                onRemove={() => removeSocial("spotify")}
                icon={<RiSpotifyLine className="size-6 text-[#757575]" />}
                hasValue={!!socials.spotify}
              />
              <SocialBadge
                onClick={() => openSocialModal("linkedin")}
                onRemove={() => removeSocial("linkedin")}
                icon={<RiLinkedinBoxLine className="size-6 text-[#757575]" />}
                hasValue={!!socials.linkedin}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Profile Modal */}
      <FluriFormDialogShell
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        title="Perfil"
        onClose={() => setIsProfileModalOpen(false)}
      >
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Nome de exibição
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              Frase curta (Tagline)
            </label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ex: Psicóloga Clínica | TCC"
              className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-4"
            />
            <p className="text-[11px] text-zinc-400 font-medium ml-1">
              Uma frase curta que aparece logo abaixo do seu nome.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
              URL Personalizada
            </label>
            <div className="flex items-center gap-0 bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-zinc-300 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
              <span className="pl-4 text-zinc-400 font-semibold text-sm whitespace-nowrap">
                me.fluri.com.br/
              </span>
              <input
                value={linktreeSlug}
                onChange={(e) => setLinktreeSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                onBlur={onSlugBlur}
                className="w-full h-12 pr-4 bg-transparent border-none focus:ring-0 font-bold text-sm text-zinc-900 outline-none"
              />
            </div>
            {isCheckingSlug ? (
              <p className="text-xs text-zinc-400 font-medium ml-1">
                Verificando disponibilidade...
              </p>
            ) : slugError ? (
              <p className="text-xs text-red-500 font-medium ml-1">{slugError}</p>
            ) : null}
          </div>
        </div>

        <FluriFormDialogFooter
          onCancel={() => setIsProfileModalOpen(false)}
          onSubmit={() => setIsProfileModalOpen(false)}
          submitLabel="Concluído"
        />
      </FluriFormDialogShell>

      {/* Appearance Modal */}
      <FluriFormDialogShell
        open={isAppearanceModalOpen}
        onOpenChange={setIsAppearanceModalOpen}
        title="Fotos"
        onClose={() => setIsAppearanceModalOpen(false)}
        showBackButton={!!cropFile}
        onBack={() => {
          cropAppliedRef.current = false;
          setCropFile(null);
        }}
      >
        <div className="space-y-8 px-6 py-6">
          {uploadError && <p className="text-sm text-red-500 mb-4">{uploadError}</p>}
          {cropFile ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Ajustar Imagem
                </label>
              </div>
              <div className="bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 p-4">
                <ImageCrop
                  file={cropFile.file}
                  aspect={cropFile.type === "avatar" ? 1 : 16 / 9}
                  onCrop={(img) => void handleCropComplete(img)}
                >
                  <ImageCropContent className="max-h-[300px] w-full object-contain" />
                  <div className="mt-4 flex justify-end">
                    <ImageCropApply asChild>
                      <BrandButton
                        disabled={isUploading}
                        size="small"
                        family="rounded"
                        className="bg-zinc-900 text-white hover:bg-zinc-800"
                      >
                        {isUploading ? "Salvando..." : "Salvar foto"}
                      </BrandButton>
                    </ImageCropApply>
                  </div>
                </ImageCrop>
              </div>
              <p className="text-xs text-zinc-400 text-center">
                Arraste para ajustar o enquadramento
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Imagem de perfil
                </label>
                <div className="flex items-center gap-6 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                  <Avatar className="size-20 border-2 border-white shadow-sm">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-zinc-100 text-zinc-400">
                      <Plus className="size-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      ref={avatarInputRef}
                      onChange={(e) => handleFileChange(e, "avatar")}
                    />
                    <BrandButton
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploading}
                      size="small"
                      family="rounded"
                      className="bg-zinc-900 text-white"
                    >
                      {isUploading ? "Enviando..." : "Alterar foto"}
                    </BrandButton>
                    <p className="text-[11px] text-zinc-400 font-medium px-2">
                      Recomendado: 400x400px. PNG ou JPG.
                    </p>
                  </div>
                </div>
              </div>

              {setBackgroundImageUrl && (
                <div className="space-y-4">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Imagem de plano de fundo
                  </label>
                  <div className="flex flex-col gap-4 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                    {backgroundImageUrl && (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200">
                        <Image src={backgroundImageUrl} fill className="object-cover" alt="Capa" />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        ref={backgroundInputRef}
                        onChange={(e) => handleFileChange(e, "background")}
                      />
                      <BrandButton
                        onClick={() => backgroundInputRef.current?.click()}
                        disabled={isUploading}
                        variant="neutral"
                        size="small"
                        family="rounded"
                        className="flex-1 border-zinc-200"
                      >
                        {isUploading ? "Enviando..." : "Subir capa"}
                      </BrandButton>
                      {backgroundImageUrl && (
                        <BrandButton
                          variant="ghost"
                          size="small"
                          family="rounded"
                          onClick={() => {
                            if (backgroundImagePath) {
                              void deleteStorageObject(uploadBucket, backgroundImagePath);
                            } else if (backgroundImageUrl) {
                              void deleteStorageObjectByUrl(uploadBucket, backgroundImageUrl);
                            }
                            setBackgroundImageUrl?.("");
                            setBackgroundImagePath?.("");
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Remover
                        </BrandButton>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium px-2">
                      Recomendado: 1200x675px (16:9).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!cropFile && (
          <FluriFormDialogFooter
            onCancel={() => setIsAppearanceModalOpen(false)}
            onSubmit={() => setIsAppearanceModalOpen(false)}
            submitLabel="Concluído"
          />
        )}
      </FluriFormDialogShell>

      {/* Social Media Individual Modal */}
      <FluriFormDialogShell
        open={isSocialModalOpen}
        onOpenChange={setIsSocialModalOpen}
        title={`Adicionar ícone ${formatPlatformName(activeSocialPlatform)}`}
        onClose={() => setIsSocialModalOpen(false)}
      >
        <div className="space-y-6 px-6 py-6">
          <div className="space-y-3">
            <div className="relative">
              <input
                value={tempSocialValue}
                onChange={(e) => setTempSocialValue(e.target.value)}
                placeholder={`Nome de usuário do ${formatPlatformName(activeSocialPlatform)}*`}
                className="w-full h-12 rounded-xl bg-[#F9F9F8] border-none focus:bg-[#F3F3F1] transition-all font-medium text-zinc-900 px-4 text-base outline-none ring-0 focus-visible:ring-0"
              />
            </div>
            <p className="text-sm text-zinc-500 font-medium ml-2 tracking-tight opacity-70">
              Exemplo: @{activeSocialPlatform}usuario
            </p>
          </div>
        </div>

        <FluriFormDialogFooter
          onCancel={() => setIsSocialModalOpen(false)}
          onSubmit={handleAddSocial}
          submitLabel="Adicionar"
          disabled={!tempSocialValue}
        />
      </FluriFormDialogShell>
    </>
  );
}

function SocialBadge({
  icon,
  hasValue,
  onClick,
  onRemove,
}: {
  icon: ReactNode;
  hasValue: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="relative group flex items-center justify-center">
      <div
        onClick={onClick}
        className={cn(
          "cursor-pointer transition-all hover:scale-110 active:scale-95",
          !hasValue && "opacity-30 group-hover:opacity-60",
        )}
      >
        {icon}
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (hasValue) {
            onRemove?.();
          } else {
            onClick?.();
          }
        }}
        className={cn(
          "flex items-center justify-center rounded-full border border-zinc-200 bg-white absolute top-[-7px] right-[-7px] size-4 shadow-sm transition-all cursor-pointer group/remove",
          hasValue
            ? "hover:bg-red-500 hover:border-red-500"
            : "hover:bg-zinc-50 hover:border-zinc-300",
        )}
      >
        {hasValue ? (
          <RiCloseLine className="size-3 text-zinc-900 group-hover/remove:text-white transition-colors" />
        ) : (
          <Plus className="size-2.5 text-zinc-900 stroke-[2.5px]" />
        )}
      </div>
    </div>
  );
}
