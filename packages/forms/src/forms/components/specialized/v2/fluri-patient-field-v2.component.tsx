"use client";

import { Check } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
  FluriFieldV2Combobox,
  type FluriFieldV2ComboboxProps,
} from "@workspace/forms/components/base/v2/fluri-field-v2-combobox.component";
import type { V2PatientFieldBinding } from "@workspace/forms/v2/rhf";

export interface FluriPatientFieldV2Option {
  id: string;
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
  disabled?: boolean;
}

export interface FluriPatientFieldV2Props extends Omit<
  FluriFieldV2ComboboxProps,
  "options" | "value" | "onValueChange" | "label"
> {
  label?: string;
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  options: FluriPatientFieldV2Option[];
  field?: V2PatientFieldBinding;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const FluriPatientFieldV2 = ({
  label = "Paciente",
  value,
  onValueChange,
  options,
  field,
  placeholder = "Selecione um paciente",
  searchPlaceholder = "Buscar paciente...",
  ...props
}: FluriPatientFieldV2Props) => {
  const mappedOptions = options.map((patient) => ({
    value: patient.id,
    label: patient.name,
    ...(patient.disabled !== undefined ? { disabled: patient.disabled } : {}),
  }));

  const byId = new Map(options.map((patient) => [patient.id, patient]));

  return (
    <FluriFieldV2Combobox
      label={label}
      {...(value !== undefined ? { value } : {})}
      {...(onValueChange !== undefined ? { onValueChange } : {})}
      {...(field !== undefined ? { field } : {})}
      options={mappedOptions}
      size="md"
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      renderSelectedAccessory={(option) => {
        const patient = byId.get(option.value);
        if (!patient) return null;

        return (
          <Avatar className="size-8 shrink-0 border-0 shadow-none">
            <AvatarImage src={patient.avatarUrl ?? undefined} className="rounded-full" />
            <AvatarFallback className="text-[11px] border-0 bg-muted/80 text-muted-foreground">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
        );
      }}
      renderOption={(option, selected) => {
        const patient = byId.get(option.value);
        if (!patient) return <span className="flex-1">{option.label}</span>;

        return (
          <>
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-7">
                <AvatarImage src={patient.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">{getInitials(patient.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-sm">{patient.name}</span>
                {patient.subtitle ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {patient.subtitle}
                  </span>
                ) : null}
              </span>
            </div>
            {selected ? <Check className="ml-auto size-4 text-primary" /> : null}
          </>
        );
      }}
      {...props}
    />
  );
};

export { FluriPatientFieldV2 };
export default FluriPatientFieldV2;
