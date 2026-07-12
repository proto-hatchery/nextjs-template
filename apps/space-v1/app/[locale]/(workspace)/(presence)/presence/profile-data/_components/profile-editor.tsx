"use client";

import { RiBookOpenLine, RiCloseLine, RiUserLine } from "@remixicon/react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { useState } from "react";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  type: "academic" | "professional";
}

interface ProfileData {
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl?: string;
  avatarPath?: string;
  backgroundUrl?: string;
  backgroundPath?: string;
  city: string;
  state: string;
  languages: string[];
  keywords: string[];
  therapeuticApproaches: string[];
  academicTimeline: TimelineItem[];
  professionalTimeline: TimelineItem[];
  registeredSpecialties: string[];
  galleryPhotos: string[];
  isPublic: boolean;
  showInMarketplace: boolean;
}

interface ProfileEditorProps {
  profileData: ProfileData;
  setProfileData: (
    data: Partial<ProfileData> | ((prev: ProfileData) => Partial<ProfileData>),
  ) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function ProfileEditor({
  profileData,
  setProfileData,
  onSave,
  isSaving = false,
}: ProfileEditorProps) {
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);

  const updateProfileData = (updates: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col w-full max-w-2xl px-4 md:px-0 animate-in fade-in duration-500">
      {/* Header */}
      <section className="flex flex-row space-x-3 items-center justify-between border-b border-solid border-[#E0E2D9] mx-[-1em] px-4 pb-6 md:border-none md:mx-0 md:px-0 md:pb-4 mb-6">
        <div className="relative min-w-[64px] max-w-[64px] rounded-full overflow-visible flex">
          <div
            onClick={() => setIsBasicInfoModalOpen(true)}
            className="size-16 rounded-full overflow-hidden border border-solid border-zinc-200 cursor-pointer hover:brightness-90 transition-all flex items-center justify-center bg-zinc-100"
          >
            <Avatar className="size-full rounded-full">
              <AvatarImage src={profileData.avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-zinc-100 text-zinc-400 flex items-center justify-center">
                <RiUserLine className="size-6" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex flex-col gap-2 grow min-w-0 ml-3">
          <div className="flex items-center gap-1 text-left">
            <a
              onClick={() => setIsBasicInfoModalOpen(true)}
              className="text-black leading-tight cursor-pointer text-ellipsis overflow-hidden font-semibold text-base hover:underline transition-all active:opacity-70"
            >
              {profileData.displayName ?? "Seu Nome"}
            </a>
          </div>
          <p className="text-sm text-zinc-600 line-clamp-2">
            {profileData.tagline ?? "Sua tagline profissional"}
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <BrandButton
          onClick={() => setIsBasicInfoModalOpen(true)}
          variant="neutral"
          className="h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2"
        >
          <RiUserLine className="size-4" />
          Dados Básicos
        </BrandButton>
        <BrandButton
          onClick={() => setIsProfessionalModalOpen(true)}
          variant="neutral"
          className="h-12 rounded-full font-medium text-sm flex items-center justify-center gap-2"
        >
          <RiBookOpenLine className="size-4" />
          Profissional
        </BrandButton>
      </div>

      {/* Visibility Settings */}
      <Card className="p-6 mb-8">
        <h3 className="text-base font-bold text-zinc-900 mb-4">Visibilidade</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900">Perfil Público</p>
              <p className="text-sm text-zinc-500">Seu perfil pode ser encontrado publicamente</p>
            </div>
            <Switch
              checked={profileData.isPublic}
              onCheckedChange={(checked) => updateProfileData({ isPublic: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900">Mostrar no Marketplace</p>
              <p className="text-sm text-zinc-500">Aparecer nas buscas do Fluri</p>
            </div>
            <Switch
              checked={profileData.showInMarketplace}
              onCheckedChange={(checked) => updateProfileData({ showInMarketplace: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <BrandButton
        onClick={onSave}
        disabled={isSaving}
        className="w-full h-14 rounded-full font-bold text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all"
      >
        {isSaving ? "Salvando..." : "Salvar Alterações"}
      </BrandButton>

      {/* Basic Info Modal */}
      <FluriDialogV2 open={isBasicInfoModalOpen} onOpenChange={setIsBasicInfoModalOpen}>
        <FluriDialogV2Content
          showCloseButton={false}
          title="Dados Básicos"
          hideTitle
          className="sm:max-w-[540px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl"
        >
          <div className="flex flex-col h-auto max-h-[90vh] bg-white">
            <div className="p-8 pb-4 flex items-center justify-between shrink-0">
              <FluriDialogV2Title className="font-bold text-2xl text-zinc-900 tracking-tight">
                Dados Básicos
              </FluriDialogV2Title>
              <BrandButton
                variant="ghost"
                size="icon"
                className="size-8 rounded-full hover:bg-zinc-100 p-0"
                onClick={() => setIsBasicInfoModalOpen(false)}
              >
                <RiCloseLine className="size-6 text-zinc-500" />
              </BrandButton>
            </div>

            <ScrollArea className="flex-1 px-8 pb-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Nome de Exibição
                  </label>
                  <Input
                    value={profileData.displayName}
                    onChange={(e) => updateProfileData({ displayName: e.target.value })}
                    placeholder="Seu nome profissional"
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Tagline Profissional
                  </label>
                  <Input
                    value={profileData.tagline}
                    onChange={(e) => updateProfileData({ tagline: e.target.value })}
                    placeholder="Psicólogo Clínico Especialista em..."
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Bio
                  </label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => updateProfileData({ bio: e.target.value })}
                    placeholder="Fale sobre sua formação, especialidades e abordagem..."
                    className="w-full min-h-[120px] p-5 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium text-sm outline-none resize-none text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      Cidade
                    </label>
                    <Input
                      value={profileData.city}
                      onChange={(e) => updateProfileData({ city: e.target.value })}
                      placeholder="São Paulo"
                      className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                      Estado
                    </label>
                    <Input
                      value={profileData.state}
                      onChange={(e) => updateProfileData({ state: e.target.value })}
                      placeholder="SP"
                      className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Idiomas
                  </label>
                  <Input
                    value={profileData.languages.join(", ")}
                    onChange={(e) =>
                      updateProfileData({
                        languages: e.target.value
                          .split(",")
                          .map((l: string) => l.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Português, Inglês, Espanhol"
                    className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all font-semibold text-zinc-900 px-5"
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="p-8 pt-4 shrink-0 border-t border-zinc-100">
              <BrandButton
                onClick={() => setIsBasicInfoModalOpen(false)}
                className="w-full h-14 rounded-full font-bold text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all"
              >
                Concluído
              </BrandButton>
            </div>
          </div>
        </FluriDialogV2Content>
      </FluriDialogV2>

      {/* Professional Modal */}
      <FluriDialogV2 open={isProfessionalModalOpen} onOpenChange={setIsProfessionalModalOpen}>
        <FluriDialogV2Content
          showCloseButton={false}
          title="Informações Profissionais"
          hideTitle
          className="sm:max-w-[540px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl"
        >
          <div className="flex flex-col h-auto max-h-[90vh] bg-white">
            <div className="p-8 pb-4 flex items-center justify-between shrink-0">
              <FluriDialogV2Title className="font-bold text-2xl text-zinc-900 tracking-tight">
                Informações Profissionais
              </FluriDialogV2Title>
              <BrandButton
                variant="ghost"
                size="icon"
                className="size-8 rounded-full hover:bg-zinc-100 p-0"
                onClick={() => setIsProfessionalModalOpen(false)}
              >
                <RiCloseLine className="size-6 text-zinc-500" />
              </BrandButton>
            </div>

            <ScrollArea className="flex-1 px-8 pb-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Palavras-chave
                  </label>
                  <Textarea
                    value={profileData.keywords.join(", ")}
                    onChange={(e) =>
                      updateProfileData({
                        keywords: e.target.value
                          .split(",")
                          .map((s: string) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Ansiedade, Depressão, Relacionamentos..."
                    className="w-full min-h-[80px] p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium text-sm outline-none resize-none text-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Abordagens Terapêuticas
                  </label>
                  <Textarea
                    value={profileData.therapeuticApproaches.join(", ")}
                    onChange={(e) =>
                      updateProfileData({
                        therapeuticApproaches: e.target.value
                          .split(",")
                          .map((a: string) => a.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="TCC, Psicanálise, Humanista..."
                    className="w-full min-h-[80px] p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium text-sm outline-none resize-none text-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Especialidades Registradas
                  </label>
                  <Textarea
                    value={profileData.registeredSpecialties.join(", ")}
                    onChange={(e) =>
                      updateProfileData({
                        registeredSpecialties: e.target.value
                          .split(",")
                          .map((s: string) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Psicologia Clínica, Neuropsicologia..."
                    className="w-full min-h-[80px] p-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/5 transition-all font-medium text-sm outline-none resize-none text-zinc-600"
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="p-8 pt-4 shrink-0 border-t border-zinc-100">
              <BrandButton
                onClick={() => setIsProfessionalModalOpen(false)}
                className="w-full h-14 rounded-full font-bold text-base bg-zinc-900 hover:bg-zinc-800 text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all"
              >
                Concluído
              </BrandButton>
            </div>
          </div>
        </FluriDialogV2Content>
      </FluriDialogV2>
    </div>
  );
}
