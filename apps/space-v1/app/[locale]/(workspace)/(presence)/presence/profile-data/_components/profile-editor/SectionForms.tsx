"use client";

import { TimelineCard } from "@/compat/features/public-profile/ui/timeline-card";
import { FluriFieldV2Combobox } from "@workspace/forms/components/base/v2/fluri-field-v2-combobox";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2TextArea } from "@workspace/forms/components/base/v2/fluri-field-v2-textarea";
import { useApproachesCatalog, useSpecialtiesCatalog } from "@workspace/supabase-data/hooks/catalogs";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { VideoSectionDialog } from "../video-section-dialog";

interface BasicSectionFormProps {
  profileData: {
    displayName: string;
    bio: string;
  };
  updateField: (field: keyof BasicSectionFormProps["profileData"], value: string) => void;
}

interface ArraySectionFormProps {
  items: string[];
  onAdd?: (value: string) => void;
  onRemove?: (index: number) => void;
  onUpdateAll?: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  type?: "specialties" | "approaches" | "languages" | "registered";
  isEditing?: boolean;
}

interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  type: "academic" | "professional";
}

interface TimelineSectionFormProps {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
  type: "academic" | "professional";
}

interface GallerySectionFormProps {
  photos: string[];
  onRemove: (index: number) => void;
}

interface VideoSectionValue {
  url: string;
  title?: string;
  description?: string;
}

interface VideoSectionFormProps {
  value?: VideoSectionValue;
  onChange: (value: VideoSectionValue) => void;
}

export function BasicSectionForm({ profileData, updateField }: BasicSectionFormProps) {
  return (
    <div className="space-y-6">
      <FluriFieldV2Input
        label="Nome de Exibição"
        value={profileData.displayName}
        onValueChange={(val) => updateField("displayName", val)}
        placeholder="Seu nome completo"
        fullWidth
      />
      <FluriFieldV2TextArea
        label="Descrição"
        value={profileData.bio}
        onValueChange={(val) => updateField("bio", val)}
        placeholder="Fale um pouco sobre você, sua formação e como você ajuda seus pacientes..."
        helperText="Conte brevemente sobre sua trajetória e especialidades."
        rows={4}
        fullWidth
      />
    </div>
  );
}

export function ArraySectionForm({
  items,
  onUpdateAll,
  placeholder,
  label,
  type,
  isEditing = true,
}: ArraySectionFormProps) {
  const { data: specialtiesRef } = useSpecialtiesCatalog();
  const { data: approachesRef } = useApproachesCatalog();

  const options = useMemo(() => {
    let baseOptions: { value: string; label: string }[] = [];
    if (type === "specialties" || type === "registered") {
      baseOptions = (specialtiesRef ?? []).map((s) => ({ value: s.name, label: s.name }));
    } else if (type === "approaches") {
      baseOptions = (approachesRef ?? []).map((a) => ({ value: a.name, label: a.name }));
    }

    // Filter out options that are already selected
    return baseOptions.filter((opt) => !items.includes(opt.value));
  }, [type, specialtiesRef, approachesRef, items]);

  const renderBadges = () => (
    <div className="flex flex-wrap gap-2">
      {items.map((item: string, index: number) => (
        <Badge
          key={index}
          variant="secondary"
          className={cn(
            "flex items-center gap-1 font-medium shrink-0 rounded-full py-1",
            type === "specialties" || type === "approaches" || type === "registered"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20"
              : "",
          )}
        >
          {item}
          {isEditing && (
            <button
              type="button"
              onClick={() => onUpdateAll?.(items.filter((_, i) => i !== index))}
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer flex items-center justify-center bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground p-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );

  if (!isEditing) {
    return renderBadges();
  }

  if (type === "specialties" || type === "approaches" || type === "registered") {
    const isRegistered = type === "registered" || label?.toLowerCase().includes("registradas");
    const maxSelected = isRegistered ? 2 : undefined;

    return (
      <div className="space-y-4">
        {renderBadges()}
        <FluriFieldV2Combobox
          label={
            label ??
            (type === "specialties"
              ? "Palavras-chave"
              : type === "approaches"
                ? "Abordagens"
                : "Especialidades Registradas")
          }
          options={options}
          onValueChange={(val) => {
            if (val && !items.includes(val)) {
              if (maxSelected && items.length >= maxSelected) return;
              onUpdateAll?.([...items, val]);
            }
          }}
          {...(placeholder !== undefined ? { searchPlaceholder: placeholder } : {})}
          fullWidth
          disabled={maxSelected ? items.length >= maxSelected : false}
          helperText={
            isRegistered && items.length >= 2
              ? "Limite máximo de 2 especialidades atingido (Regra CFP)."
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderBadges()}
      <FluriFieldV2Input
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value.trim()) {
            onUpdateAll?.([...items, e.currentTarget.value.trim()]);
            e.currentTarget.value = "";
          }
        }}
        fullWidth
        showClearButton={false}
      />
    </div>
  );
}

export function TimelineSectionForm({ items, onChange, type }: TimelineSectionFormProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = (values: Record<string, string | boolean | null | undefined>) => {
    const newItem: TimelineItem = {
      id: crypto.randomUUID(),
      title: (values.title as string) ?? "",
      subtitle: (values.subtitle as string) ?? "",
      startDate: (values.startDate as string) ?? "",
      endDate: values.isCurrent ? null : ((values.endDate as string) ?? ""),
      isCurrent: Boolean(values.isCurrent ?? false),
      type,
    };
    onChange([...items, newItem]);
    setIsAdding(false);
  };

  const handleUpdate = (
    id: string,
    values: Record<string, string | boolean | null | undefined>,
  ) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              title: (values.title as string) ?? "",
              subtitle: (values.subtitle as string) ?? "",
              startDate: (values.startDate as string) ?? "",
              endDate: values.isCurrent ? null : ((values.endDate as string) ?? ""),
              isCurrent: Boolean(values.isCurrent ?? false),
            }
          : item,
      ),
    );
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <TimelineCard
          key={item.id}
          index={index + 1}
          type={type}
          title={item.title}
          subtitle={item.subtitle}
          startDate={item.startDate}
          endDate={item.endDate}
          isCurrent={item.isCurrent}
          defaultValues={{
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            startDate: item.startDate,
            endDate: item.endDate,
            isCurrent: item.isCurrent,
          }}
          onSave={(values) => handleUpdate(item.id, values)}
          onRemove={() => handleRemove(item.id)}
        />
      ))}

      {isAdding ? (
        <TimelineCard
          index={items.length + 1}
          type={type}
          title=""
          subtitle=""
          defaultValues={{
            title: "",
            subtitle: "",
            startDate: "",
            endDate: null,
            isCurrent: false,
          }}
          onSave={handleCreate}
          onCancel={() => setIsAdding(false)}
          showCancelButton={true}
          initialEditing={true}
        />
      ) : (
        <BrandButton
          variant="ghost"
          size="small"
          family="rounded"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed border-2 py-8"
        >
          <Plus className="size-4 mr-2" />
          Adicionar {type === "academic" ? "Formação" : "Experiência"}
        </BrandButton>
      )}
    </div>
  );
}

export function GallerySectionForm({ photos, onRemove }: GallerySectionFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo: string, index: number) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image src={photo} alt={`Gallery ${index + 1}`} fill className="object-cover" />
            </div>
            <BrandButton
              type="button"
              variant="destructive"
              size="sm"
              family="rounded"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="w-4 h-4" />
            </BrandButton>
          </div>
        ))}
        <div className="aspect-square rounded-2xl bg-zinc-50 flex items-center justify-center">
          <BrandButton type="button" variant="ghost" family="rounded" fullWidth>
            <Upload className="w-8 h-8 text-gray-400" />
          </BrandButton>
        </div>
      </div>
    </div>
  );
}

export function VideoSectionForm({ value, onChange }: VideoSectionFormProps) {
  return (
    <VideoSectionDialog
      value={value ?? { url: "", title: "", description: "" }}
      onChange={onChange}
    />
  );
}
