"use client";

import { Pencil, Loader2, Heart } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { BrandButton as Button } from "@workspace/brand/components/brand-button";
import { Badge } from "@workspace/ui/components/badge";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Currency } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { formatCurrency } from "@workspace/ui/lib/format";
import { Card } from "@workspace/brand/patterns/card";

const serviceCardSchema = z.object({
  serviceId: z.string().min(1, "Tipo de serviço é obrigatório"),
  price: z.string().min(1, "Valor é obrigatório"),
  durationMinutes: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(180, "Duração máxima é 180 minutos"),
});

export type ServiceCardFormValues = z.infer<typeof serviceCardSchema>;

export interface ServiceCatalogOption {
  value: string;
  label: string;
}

export interface ServiceCardProps {
  /** Index number displayed in the badge (1, 2, 3, etc.) */
  index: number;
  /** Service name/title displayed in view mode */
  title: string;
  /** Subtitle/label displayed below the title */
  subtitle: string;
  /** Price in cents (e.g., 15000 for R$ 150,00) */
  price: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Default values for edit mode form */
  defaultValues: ServiceCardFormValues;
  /** Available service options for the select dropdown */
  servicesCatalog: ServiceCatalogOption[];
  /** Callback when save is clicked with updated values */
  onSave: (values: ServiceCardFormValues) => Promise<void>;
  /** Optional callback when cancel is clicked */
  onCancel?: () => void;
  /** Optional callback to remove the service */
  onRemove?: () => void;
  /** Whether the remove action is loading */
  isRemoving?: boolean;
  /** Optional badge label shown in edit mode (e.g., "Atendimento") */
  categoryBadge?: string;
  /** Whether to start in edit mode (useful for "New Service" flow) */
  initialEditing?: boolean;
  /** Whether to show the cancel button in edit mode (default: true) */
  showCancelButton?: boolean;
}

/**
 * Service Card component with VIEW and EDIT modes.
 *
 * VIEW MODE:
 * - Displays numbered badge, title, subtitle, price, and duration
 * - Edit action appears on hover (desktop) or always visible (mobile)
 *
 * EDIT MODE:
 * - Inline form with service type select, price input, and duration input
 * - Save and Cancel actions
 *
 * Used in: Preferences page, Onboarding flow
 */
export function ServiceCard({
  index,
  title,
  subtitle,
  price,
  durationMinutes,
  defaultValues,
  servicesCatalog,
  onSave,
  onCancel,
  onRemove,
  isRemoving,
  categoryBadge = "Atendimento",
  initialEditing = false,
  showCancelButton = true,
}: ServiceCardProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ServiceCardFormValues>({
    resolver: zodResolver(serviceCardSchema),
    defaultValues,
  });

  const formattedPrice = formatCurrency(price);

  const getPriceInCents = (formatted: string): number => {
    const numbers = formatted.replace(/\D/g, "");
    return parseInt(numbers, 10) || 0;
  };

  const handlePriceChange = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) {
      form.setValue("price", "");
      return;
    }
    const cents = parseInt(numbers, 10);
    form.setValue("price", formatCurrency(cents));
  };

  const handleSubmit = async (values: ServiceCardFormValues) => {
    try {
      setIsSaving(true);
      await onSave(values);
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

  // EDIT MODE - Two column layout like Screenshot #3
  if (isEditing) {
    return (
      <Card className="border-transparent bg-muted/40 p-6 shadow-none" suppressHydrationWarning>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left side - Title area */}
          <div className="flex flex-col shrink-0 md:w-1/2 md:max-w-[50%]">
            <Badge variant="secondary" className="mb-3 w-fit gap-1.5">
              <Heart className="h-3 w-3" />
              {categoryBadge}
            </Badge>
            <h3 className="text-lg font-semibold leading-tight tracking-tight">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Defina o nome, valor e duração do serviço que você deseja oferecer aos seus pacientes.
            </p>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 w-full min-w-0">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Service Type Select */}
              <Controller
                control={form.control}
                name="serviceId"
                render={({ field, fieldState }) => (
                  <FluriFieldV2Select
                    label="Tipo de Serviço"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={servicesCatalog}
                    errorMessage={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />

              {/* Price and Duration Row */}
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="price"
                  render={({ field, fieldState }) => (
                    <FluriFieldV2Currency
                      label="Valor"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        handlePriceChange(e.target.value);
                      }}
                      onBlur={field.onBlur}
                      errorMessage={fieldState.error?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="durationMinutes"
                  render={({ field, fieldState }) => (
                    <FluriFieldV2Input
                      label="Duração (min)"
                      type="number"
                      min={15}
                      max={180}
                      value={field.value.toString()}
                      onChange={(e) => field.onChange(Number(e.target.value) || 50)}
                      onBlur={field.onBlur}
                      errorMessage={fieldState.error?.message}
                      fullWidth
                    />
                  )}
                />
              </div>

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
                    disabled={isSaving || getPriceInCents(form.watch("price")) <= 0}
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : "Salvar"}
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
    <div className="group flex items-center gap-4 rounded-xl bg-muted/40 p-4">
      {/* Numbered Badge */}
      <div className="shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {index}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
        {/* Title and Subtitle */}
        <div className="min-w-0 flex-1 sm:max-w-[200px]">
          <h4 className="truncate text-sm font-semibold text-foreground">{title}</h4>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 sm:block sm:min-w-[140px]">
          <span className="text-xs text-muted-foreground sm:hidden">Valor:</span>
          <div>
            <p className="hidden text-[10px] uppercase text-muted-foreground/70 sm:block">
              Valor da Sessão
            </p>
            <p className="text-sm font-medium text-foreground">{formattedPrice}</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 sm:block sm:min-w-[120px]">
          <span className="text-xs text-muted-foreground sm:hidden">Duração:</span>
          <div>
            <p className="hidden text-[10px] uppercase text-muted-foreground/70 sm:block">
              Duração Estimada
            </p>
            <p className="text-sm font-medium text-foreground">{durationMinutes} minutos</p>
          </div>
        </div>
      </div>

      {/* Edit Action */}
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer h-8 gap-2 text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:text-primary hover:bg-primary/5"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">Editar</span>
        </Button>
      </div>
    </div>
  );
}
