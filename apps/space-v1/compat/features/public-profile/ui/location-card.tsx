"use client";

import { Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@workspace/ui/components/badge";
import { BrandButton as Button } from "@workspace/brand/components/brand-button";
import { Card } from "@workspace/ui/components/card";
import { FluriFieldV2Cep } from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import type { AddressData } from "@workspace/forms/types/address.types";

const locationCardSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  postalCode: z.string().min(1, "CEP é obrigatório"),
});

export type LocationCardFormValues = z.infer<typeof locationCardSchema>;

export interface LocationCardProps {
  /** Index number displayed in the badge (1, 2, 3, etc.) */
  index: number;
  /** Location name displayed in view mode */
  name: string;
  /** Street address (view mode) */
  street: string;
  /** Street number (view mode) */
  number: string;
  /** City (view mode) */
  city: string;
  /** State (view mode) */
  state: string;
  /** Default values for edit mode form */
  defaultValues: LocationCardFormValues;
  /** Callback when save is clicked with updated values */
  onSave: (values: LocationCardFormValues) => Promise<void>;
  /** Optional callback when cancel is clicked */
  onCancel?: () => void;
  /** Optional callback to remove the location */
  onRemove?: () => void;
  /** Whether the remove action is loading */
  isRemoving?: boolean;
  /** Whether to start in edit mode (e.g. "New location" flow) */
  initialEditing?: boolean;
  /** Whether to show the cancel button in edit mode (default: true) */
  showCancelButton?: boolean;
  /** Whether to show remove action in view mode (default: true when callback provided) */
  showRemoveAction?: boolean;
}

/**
 * Location/Address Card component with VIEW and EDIT modes.
 *
 * VIEW MODE:
 * - Displays numbered badge, name, address line (street + number), city-state
 * - Edit action on hover; optional Remove
 *
 * EDIT MODE:
 * - Inline form: name, CEP (with ViaCEP), street, number, complement, neighborhood, city, state
 * - Save and Cancel actions; optional Remove
 *
 * Used in: Preferences (LocationsSection), Onboarding (locations step)
 */
export function LocationCard({
  index,
  name,
  street,
  number,
  city,
  state,
  defaultValues,
  onSave,
  onCancel,
  onRemove,
  isRemoving = false,
  initialEditing = false,
  showCancelButton = true,
  showRemoveAction = true,
}: LocationCardProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(Boolean(defaultValues.street?.trim()));
  const addressNumberFieldRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<LocationCardFormValues>({
    resolver: zodResolver(locationCardSchema),
    defaultValues,
  });

  const handleAddressFound = useCallback(
    (foundAddress: AddressData) => {
      form.setValue("street", foundAddress.street ?? "", { shouldValidate: false });
      form.setValue("neighborhood", foundAddress.neighborhood ?? "", { shouldValidate: false });
      form.setValue("city", foundAddress.city ?? "", { shouldValidate: false });
      form.setValue("state", foundAddress.state ?? "", { shouldValidate: false });
      form.clearErrors("street");
      form.clearErrors("neighborhood");
      form.clearErrors("city");
      form.clearErrors("state");
      setShowAddressFields(true);
      setTimeout(() => {
        addressNumberFieldRef.current?.focus();
      }, 100);
    },
    [form],
  );

  useEffect(() => {
    if (initialEditing && defaultValues.street?.trim()) {
      setShowAddressFields(true);
    }
  }, [initialEditing, defaultValues.street]);

  const handleSubmit = async (values: LocationCardFormValues) => {
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
    setShowAddressFields(Boolean(defaultValues.street?.trim()));
    setIsEditing(false);
    onCancel?.();
  };

  const addressLine = [street, number].filter(Boolean).join(", ");
  const complementNbhdValue = defaultValues.complement?.trim()
    ? defaultValues.complement
    : defaultValues.neighborhood;
  const complementNbhdLabel = defaultValues.complement?.trim() ? "Complemento" : "Bairro";

  // EDIT MODE
  if (isEditing) {
    return (
      <Card className="border-transparent bg-muted/40 p-6 shadow-none">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
          {/* Top row: Fixed 50/50 Layout */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex flex-col shrink-0 md:w-1/2 md:max-w-[50%]">
              <Badge variant="secondary" className="mb-3 w-fit gap-1.5">
                <MapPin className="h-3 w-3" />
                Endereço
              </Badge>
              <h3 className="text-lg font-semibold leading-tight tracking-tight">
                {defaultValues.id ? "Editar Endereço" : "Novo Endereço"}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {defaultValues.id
                  ? "Atualize as informações deste local."
                  : "Adicione um novo local de atendimento."}
              </p>
            </div>

            <div className="flex-1 w-full min-w-0 space-y-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FluriFieldV2Input
                    label="Nome do Local"
                    placeholder="Ex: Consultório Centro"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    errorMessage={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                control={form.control}
                name="postalCode"
                render={({ field, fieldState }) => (
                  <FluriFieldV2Cep
                    label="CEP"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val);
                      const digits = String(val ?? "").replace(/\D/g, "");
                      if (digits.length === 8) {
                        setShowAddressFields(true);
                      } else {
                        setShowAddressFields(false);
                      }
                    }}
                    onAddressFound={handleAddressFound}
                    errorMessage={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </div>
          </div>

          {/* Bottom row: Animated expand full-width */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              showAddressFields ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0">
              <div className="pt-6 pb-1 space-y-4 px-[3px] -mx-[3px]">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <Controller
                    control={form.control}
                    name="street"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Input
                        label="Rua / Avenida"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />
                  <div className="w-20">
                    <Controller
                      control={form.control}
                      name="number"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Nº"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          inputRef={(el) => {
                            field.ref(el);
                            addressNumberFieldRef.current = el;
                          }}
                          errorMessage={fieldState.error?.message}
                          fullWidth
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="complement"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Input
                        label="Complemento (opcional)"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="neighborhood"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Input
                        label="Bairro"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="city"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Input
                        label="Cidade"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="state"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Input
                        label="Estado"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-border/40">
            <div>
              {onRemove && showRemoveAction && (
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
      </Card>
    );
  }

  // VIEW MODE
  return (
    <div className="group flex items-center gap-4 rounded-xl bg-muted/40 p-4">
      <div className="shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {index}
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 flex-1 sm:max-w-[200px]">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-foreground">{name}</h4>
          </div>
          <p className="truncate text-xs text-muted-foreground">Local de atendimento</p>
        </div>

        {addressLine ? (
          <div className="flex items-center gap-2 sm:block sm:flex-1 min-w-0">
            <span className="text-xs text-muted-foreground sm:hidden">Endereço:</span>
            <div className="min-w-0 truncate">
              <p className="hidden text-[10px] uppercase text-muted-foreground/70 sm:block">
                Endereço
              </p>
              <p className="truncate text-sm font-medium text-foreground">{addressLine}</p>
            </div>
          </div>
        ) : null}

        {complementNbhdValue ? (
          <div className="flex items-center gap-2 sm:block sm:min-w-[140px] min-w-0">
            <span className="text-xs text-muted-foreground sm:hidden">{complementNbhdLabel}:</span>
            <div className="min-w-0 truncate">
              <p className="hidden text-[10px] uppercase text-muted-foreground/70 sm:block">
                {complementNbhdLabel}
              </p>
              <p className="truncate text-sm font-medium text-foreground">{complementNbhdValue}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showRemoveAction && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer h-8 w-8 p-0 text-destructive/70 opacity-100 transition-opacity hover:bg-destructive/5 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
            onClick={onRemove}
            disabled={isRemoving}
            title="Remover"
          >
            {isRemoving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer h-8 gap-2 text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:bg-primary/5 hover:text-primary"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">Editar</span>
        </Button>
      </div>
    </div>
  );
}
