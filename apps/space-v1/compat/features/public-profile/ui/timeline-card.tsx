"use client";

import { Briefcase, GraduationCap, Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { BrandButton as Button } from "@workspace/brand/components/brand-button";
import { Badge } from "@workspace/ui/components/badge";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Checkbox } from "@workspace/forms/components/base/v2/fluri-field-v2-checkbox";
import { Card } from "@workspace/ui/components/card";

const timelineCardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Este campo é obrigatório"),
  subtitle: z.string().min(1, "Este campo é obrigatório"),
  startDate: z.string().min(1, "Início é obrigatório"),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean(),
});

export type TimelineCardFormValues = z.infer<typeof timelineCardSchema>;

export interface TimelineCardProps {
  /** Index number displayed in the badge (1, 2, 3, etc.) */
  index: number;
  /** Type of timeline item */
  type: "academic" | "professional";
  /** Main title displayed in view mode */
  title: string;
  /** Subtitle displayed in view mode */
  subtitle: string;
  /** Start date (YYYY-MM format) */
  startDate?: string;
  /** End date (YYYY-MM format) - null if isCurrent is true */
  endDate?: string | null;
  /** Whether this is currently ongoing */
  isCurrent?: boolean;
  /** Default values for edit mode form */
  defaultValues: TimelineCardFormValues;
  /** Callback when save is clicked with updated values */
  onSave: (values: TimelineCardFormValues) => Promise<void> | void;
  /** Optional callback when cancel is clicked */
  onCancel?: () => void;
  /** Optional callback to remove the item */
  onRemove?: () => void;
  /** Whether the remove action is loading */
  isRemoving?: boolean;
  /** Whether to start in edit mode (useful for "New Item" flow) */
  initialEditing?: boolean;
  /** Whether to show the cancel button in edit mode (default: true) */
  showCancelButton?: boolean;
}

/**
 * Timeline Card component with VIEW and EDIT modes.
 *
 * VIEW MODE:
 * - Displays numbered badge, title, subtitle, and period
 * - Edit action appears on hover (desktop) or always visible (mobile)
 *
 * EDIT MODE:
 * - Inline form with inputs for title, subtitle, and period
 * - Save and Cancel actions
 */
export function TimelineCard({
  index,
  type,
  title,
  subtitle,
  startDate,
  endDate,
  isCurrent,
  defaultValues,
  onSave,
  onCancel,
  onRemove,
  isRemoving,
  initialEditing = false,
  showCancelButton = true,
}: TimelineCardProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<TimelineCardFormValues>({
    resolver: zodResolver(timelineCardSchema),
    defaultValues: {
      ...defaultValues,
      isCurrent: defaultValues.isCurrent ?? !defaultValues.endDate,
    },
  });

  // Watch isCurrent to conditionally disable end date
  const watchIsCurrent = form.watch("isCurrent");

  const handleSubmit = async (values: TimelineCardFormValues) => {
    try {
      setIsSaving(true);
      // If isCurrent is true, set endDate to null
      const finalValues = {
        ...values,
        endDate: values.isCurrent ? null : values.endDate,
      };
      await onSave(finalValues);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setIsEditing(false);
    onCancel?.();
  };

  const isAcademic = type === "academic";
  const Icon = isAcademic ? GraduationCap : Briefcase;
  const categoryLabel = isAcademic ? "Formação" : "Experiência";

  // Generate year-month options for date selection
  const currentYear = new Date().getFullYear();
  const yearOptions: { value: string; label: string }[] = [];

  for (let year = currentYear; year >= currentYear - 60; year--) {
    for (let month = 12; month >= 1; month--) {
      const monthStr = month.toString().padStart(2, "0");
      const value = `${year}-${monthStr}`;
      const label = `${monthStr}/${year}`;
      yearOptions.push({ value, label });
    }
  }

  const formatDisplayDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const [year, month] = dateStr.split("-");
    return `${month}/${year}`;
  };

  const displayPeriod = isCurrent
    ? `${formatDisplayDate(startDate) ?? "Não informado"} - Presente`
    : startDate && endDate
      ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
      : startDate
        ? `${formatDisplayDate(startDate)} - Presente`
        : "Não informado";

  // EDIT MODE
  if (isEditing) {
    return (
      <Card className="border-transparent bg-muted/40 p-6 shadow-none" suppressHydrationWarning>
        <div className="flex flex-col gap-6">
          {/* Header area - now top on all screens */}
          <div className="flex flex-col shrink-0">
            <Badge variant="secondary" className="mb-3 w-fit gap-1.5">
              <Icon className="h-3 w-3" />
              {categoryLabel}
            </Badge>
            <h3 className="text-lg font-semibold leading-tight tracking-tight">
              {defaultValues.id ? `Editar ${categoryLabel}` : `Nova ${categoryLabel}`}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isAcademic
                ? "Adicione os detalhes da sua formação acadêmica."
                : "Adicione os detalhes da sua experiência profissional."}
            </p>
          </div>

          {/* Form area - now full width below header */}
          <div className="w-full min-w-0">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <FluriFieldV2Input
                    label={isAcademic ? "Instituição" : "Local de Trabalho"}
                    placeholder={
                      isAcademic ? "Ex: USP - Universidade de São Paulo" : "Ex: Clínica Viver Bem"
                    }
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    errorMessage={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <Controller
                  control={form.control}
                  name="subtitle"
                  render={({ field, fieldState }) => (
                    <FluriFieldV2Input
                      label={isAcademic ? "Formação / Curso" : "Cargo / Função"}
                      placeholder={
                        isAcademic
                          ? "Ex: Bacharelado em Psicologia"
                          : "Ex: Psicóloga Clínica Sênior"
                      }
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      errorMessage={fieldState.error?.message}
                      fullWidth
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <FluriFieldV2Select
                      label="Início"
                      placeholder="Mês/Ano"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={yearOptions}
                      errorMessage={fieldState.error?.message}
                      fullWidth
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <FluriFieldV2Select
                      label="Fim"
                      placeholder="Mês/Ano"
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      options={yearOptions}
                      errorMessage={fieldState.error?.message}
                      fullWidth
                      disabled={watchIsCurrent}
                    />
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="isCurrent"
                render={({ field }) => (
                  <FluriFieldV2Checkbox
                    label="Atualmente em andamento"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue("endDate", null);
                      }
                    }}
                  />
                )}
              />

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {onRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive/70 cursor-pointer hover:bg-destructive/5 hover:text-destructive"
                      onClick={onRemove}
                      disabled={isSaving || isRemoving}
                    >
                      {isRemoving ? <Loader2 className="animate-spin" /> : "Remover"}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {showCancelButton && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin" />
                    ) : defaultValues.id ? (
                      "Salvar"
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Card>
    );
  }

  // VIEW MODE
  return (
    <div className="group w-full min-w-0 overflow-hidden rounded-xl bg-muted/40 p-4">
      <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 sm:items-center sm:gap-4">
        {/* Numbered Badge */}
        <div className="mt-1 shrink-0 sm:mt-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {index}
          </div>
        </div>

        {/* Content */}
        <div className="grid min-w-0 grid-cols-1 gap-2 overflow-hidden sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
          {/* Title and Subtitle */}
          <div className="min-w-0 overflow-hidden">
            <h4 className="truncate text-sm leading-none font-semibold text-foreground">{title}</h4>
            <p className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>

          {/* Period */}
          <div className="min-w-0 max-w-full overflow-hidden sm:min-w-[120px] sm:text-right">
            <span className="hidden text-[10px] uppercase text-muted-foreground/70 sm:block">
              Período
            </span>
            <p className="truncate text-xs font-medium text-foreground sm:text-sm">
              {displayPeriod}
            </p>
          </div>
        </div>

        {/* Edit Action */}
        <div className="ml-2 flex shrink-0 items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 cursor-pointer gap-2 text-primary opacity-100 transition-opacity hover:bg-primary/5 hover:text-primary sm:w-auto sm:px-3 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Editar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
