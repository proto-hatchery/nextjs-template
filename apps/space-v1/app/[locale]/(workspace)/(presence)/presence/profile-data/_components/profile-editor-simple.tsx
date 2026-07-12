"use client";

import { BrandButton } from "@workspace/brand/components/brand-button";
import Image from "next/image";
import { useMemo, useState } from "react";

import { SectionCard } from "./profile-editor/SectionCard";
import {
  ArraySectionForm,
  BasicSectionForm,
  GallerySectionForm,
  TimelineSectionForm,
  VideoSectionForm,
} from "./profile-editor/SectionForms";
import type { VideoSectionValue } from "./video-section-dialog";

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

interface ProfileData {
  displayName: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  avatarPath: string;
  backgroundUrl: string;
  backgroundPath: string;
  city: string;
  state: string;
  languages: string[];
  keywords: string[];
  therapeuticApproaches: string[];
  academicTimeline: TimelineItem[];
  professionalTimeline: TimelineItem[];
  registeredSpecialties: string[];
  galleryPhotos: string[];
  videoSection?: VideoSectionValue;
  profileSections: SectionState[];
  isPublic: boolean;
  showInMarketplace: boolean;
}

interface ProfileEditorProps {
  profileData: ProfileData;
  setProfileData: (
    data: Partial<ProfileData> | ((prev: ProfileData) => Partial<ProfileData>),
  ) => void;
  onCommit?: () => void;
}

type SectionType =
  | "basic"
  | "specialties"
  | "approaches"
  | "languages"
  | "professional"
  | "academic"
  | "registered"
  | "gallery"
  | "video";

interface SectionDefinition {
  id: SectionType;
  label: string;
  group: "Essencial" | "Recomendado" | "Adicional";
}
interface SectionState {
  id: SectionType;
  active: boolean;
}

export function ProfileEditor({ profileData, setProfileData, onCommit }: ProfileEditorProps) {
  const [editingSectionId, setEditingSectionId] = useState<SectionType | null>(null);

  const updateField = (field: keyof ProfileData, value: unknown) =>
    setProfileData((prev) => ({ ...prev, [field]: value }));
  const addArrayItem = (field: keyof ProfileData, item: unknown) =>
    setProfileData((prev) => ({ ...prev, [field]: [...(prev[field] as unknown[]), item] }));
  const removeArrayItem = (field: keyof ProfileData, index: number) =>
    setProfileData((prev) => ({
      ...prev,
      [field]: (prev[field] as unknown[]).filter((_, i: number) => i !== index),
    }));

  const availableSections = useMemo<SectionDefinition[]>(
    () => [
      { id: "basic", label: "Informações básicas", group: "Essencial" },
      { id: "registered", label: "Especialidades registradas", group: "Adicional" },
      { id: "approaches", label: "Abordagens terapêuticas", group: "Recomendado" },
      { id: "specialties", label: "Palavras-chave", group: "Recomendado" },
      { id: "languages", label: "Idiomas", group: "Recomendado" },
      { id: "professional", label: "Experiência profissional", group: "Adicional" },
      { id: "academic", label: "Formação e cursos", group: "Adicional" },
      { id: "gallery", label: "Galeria de fotos", group: "Adicional" },
      { id: "video", label: "Vídeo de apresentação", group: "Recomendado" },
    ],
    [],
  );

  const toggleSectionActive = (section: SectionType, active: boolean) => {
    setProfileData((prev) => {
      const currentSections = prev.profileSections ?? [];
      const exists = currentSections.some((s) => s.id === section);

      if (exists) {
        return {
          ...prev,
          profileSections: currentSections.map((s) => (s.id === section ? { ...s, active } : s)),
        };
      } else {
        return {
          ...prev,
          profileSections: [...currentSections, { id: section, active }],
        };
      }
    });
  };

  const renderSummary = (section: SectionType) => {
    switch (section) {
      case "basic":
        return (
          <div className="text-sm">
            <strong>{profileData.displayName}</strong>
            <br />
            {profileData.bio}
          </div>
        );
      case "specialties":
      case "approaches":
      case "registered":
      case "languages":
        return (
          <ArraySectionForm
            type={
              section === "languages"
                ? "languages"
                : section === "registered"
                  ? "registered"
                  : section
            }
            items={
              section === "specialties"
                ? profileData.keywords
                : section === "approaches"
                  ? profileData.therapeuticApproaches
                  : section === "registered"
                    ? profileData.registeredSpecialties
                    : profileData.languages
            }
            isEditing={false}
          />
        );
      case "professional":
        return (
          <div className="text-xs">
            {profileData.professionalTimeline.map((t) => (
              <div key={t.id}>
                {t.title} @ {t.subtitle}
              </div>
            ))}
          </div>
        );
      case "academic":
        return (
          <div className="text-xs">
            {profileData.academicTimeline.map((t) => (
              <div key={t.id}>
                {t.title} @ {t.subtitle}
              </div>
            ))}
          </div>
        );
      case "gallery":
        return (
          <div className="grid grid-cols-4 gap-1">
            {profileData.galleryPhotos.slice(0, 4).map((p, i) => (
              <div key={i} className="aspect-square relative rounded overflow-hidden">
                <Image src={p} fill alt="" className="object-cover" />
              </div>
            ))}
          </div>
        );
      case "video":
        return <div className="text-xs truncate">{profileData.videoSection?.url}</div>;
      default:
        return null;
    }
  };

  const renderForm = (section: SectionType) => {
    switch (section) {
      case "basic":
        return <BasicSectionForm profileData={profileData} updateField={updateField} />;
      case "specialties":
        return (
          <ArraySectionForm
            type="specialties"
            items={profileData.keywords}
            onUpdateAll={(v) => updateField("keywords", v)}
            onAdd={(v) => addArrayItem("keywords", v)}
            onRemove={(i) => removeArrayItem("keywords", i)}
            placeholder="Pesquisar palavras-chave..."
            label="Palavras-chave"
          />
        );
      case "approaches":
        return (
          <ArraySectionForm
            type="approaches"
            items={profileData.therapeuticApproaches}
            onUpdateAll={(v) => updateField("therapeuticApproaches", v)}
            onAdd={(v) => addArrayItem("therapeuticApproaches", v)}
            onRemove={(i) => removeArrayItem("therapeuticApproaches", i)}
            placeholder="Pesquisar abordagens..."
          />
        );
      case "languages":
        return (
          <ArraySectionForm
            type="languages"
            items={profileData.languages}
            onUpdateAll={(v) => updateField("languages", v)}
            onAdd={(v) => addArrayItem("languages", v)}
            onRemove={(i) => removeArrayItem("languages", i)}
            placeholder="Adicionar idioma..."
          />
        );
      case "professional":
        return (
          <TimelineSectionForm
            type="professional"
            items={profileData.professionalTimeline}
            onChange={(items) => updateField("professionalTimeline", items)}
          />
        );
      case "academic":
        return (
          <TimelineSectionForm
            type="academic"
            items={profileData.academicTimeline}
            onChange={(items) => updateField("academicTimeline", items)}
          />
        );
      case "registered":
        return (
          <ArraySectionForm
            type="registered"
            items={profileData.registeredSpecialties}
            onUpdateAll={(v) => updateField("registeredSpecialties", v)}
            onAdd={(v) => addArrayItem("registeredSpecialties", v)}
            onRemove={(i) => removeArrayItem("registeredSpecialties", i)}
            placeholder="Pesquisar especialidades registradas..."
          />
        );
      case "gallery":
        return (
          <GallerySectionForm
            photos={profileData.galleryPhotos}
            onRemove={(i: number) => removeArrayItem("galleryPhotos", i)}
          />
        );
      case "video":
        return (
          <VideoSectionForm
            {...(profileData.videoSection !== undefined ? { value: profileData.videoSection } : {})}
            onChange={(v: VideoSectionValue) => updateField("videoSection", v)}
          />
        );
      default:
        return null;
    }
  };

  // Ensure all available sections are present in profileSections
  const sectionsToRender = useMemo(() => {
    const currentSections = profileData.profileSections ?? [];
    return availableSections.map((def) => {
      const existing = currentSections.find((s) => s.id === def.id);
      return {
        id: def.id,
        label: def.label,
        active: existing?.active ?? false,
      };
    });
  }, [availableSections, profileData.profileSections]);

  const toggleEditor = (section: SectionType) => {
    setEditingSectionId((prev) => (prev === section ? null : section));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {sectionsToRender.map((item) => (
          <SectionCard
            key={item.id}
            id={item.id}
            title={item.label}
            isActive={item.active}
            isEditing={editingSectionId === item.id}
            summary={renderSummary(item.id)}
            onEdit={() => toggleEditor(item.id)}
            onToggleActive={(active) => toggleSectionActive(item.id, active)}
          >
            <div className="space-y-6">
              {renderForm(item.id)}
              <div className="flex justify-end gap-2 pt-4">
                <BrandButton
                  onClick={() => setEditingSectionId(null)}
                  size="small"
                  variant="ghost"
                  family="rounded"
                  className="text-zinc-500"
                >
                  Cancelar
                </BrandButton>
                <BrandButton
                  onClick={() => {
                    setEditingSectionId(null);
                    onCommit?.();
                  }}
                  size="small"
                  variant="ghost"
                  family="rounded"
                >
                  Salvar
                </BrandButton>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
