import { FieldDisplay, type PatientField } from "@/compat/features/patients/ui/field-display";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Switch } from "@workspace/forms/components/base/v2/fluri-field-v2-switch";
import {
  FluriFieldV2Birthdate,
  FluriFieldV2Cpf,
  FluriFieldV2Phone,
} from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import type { UseFormReturn } from "@workspace/forms/react-hook-form";
import { formatCpf } from "@workspace/forms/utils/formatting";
import { formatPhoneDisplay } from "@workspace/forms/utils/phone";
import { getV2InputProps, getV2SelectProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { coerceWhatsappSessionRemindersValue } from "../../../_utils/mapper";
import type {
  PatientRecordCollections,
  PatientRecordField,
  PatientRecordSection,
  PatientRecordType,
} from "../../../types";
import { EditAddressModal } from "./edit-address-modal";

interface PersonalInfoFormValues {
  firstName: string | undefined;
  lastName: string | undefined;
  socialName: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  preferredContactMethod: string | undefined;
  whatsappRemindersEnabled: boolean;
  dateOfBirth: string | undefined;
  cpf: string | undefined;
  address: string | undefined;
  number: string | undefined;
  complement: string | undefined;
  neighborhood: string | undefined;
  city: string | undefined;
  state: string | undefined;
  postalCode: string | undefined;
  country: string | undefined;
}

type PersonalInfoFieldKey = keyof PersonalInfoFormValues;

interface PatientDetailPersonalInfoSectionProps {
  dataset: PatientRecordCollections;
  form: UseFormReturn<PersonalInfoFormValues>;
  isEditing: boolean;
}

export const GROUPS: { title: string; fields: { section: PatientRecordType; key: string }[] }[] = [
  {
    title: "Informações Pessoais",
    fields: [
      { section: "personal", key: "firstName" },
      { section: "personal", key: "lastName" },
      { section: "personal", key: "socialName" },
      { section: "personal", key: "dateOfBirth" },
      { section: "personal", key: "phone" },
      { section: "personal", key: "whatsappRemindersEnabled" },
      { section: "personal", key: "email" },
      { section: "personal", key: "cpf" },
      { section: "personal", key: "address" }, // Special handling - full width
    ],
  },
];

export function getField(
  section: PatientRecordSection | undefined,
  key: string,
): PatientRecordField | undefined {
  return section?.fields.find((field) => field.key === key);
}

function formatFieldValue(key: string, value: PatientRecordField["value"]) {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "boolean") {
    if (key === "whatsappRemindersEnabled") {
      return value ? "Ativado" : "Desativado";
    }
    return value ? "Sim" : "Não";
  }
  if (typeof value !== "string") return String(value);

  if (key === "cpf") {
    return formatCpf(value);
  }

  if (key === "phone") {
    const prefersInternational = value.trim().startsWith("+");
    const formatted = formatPhoneDisplay(value, {
      format: prefersInternational ? "international" : "national",
    });

    return formatted || value;
  }

  if (key === "preferredContactMethod") {
    const labels: Record<string, string> = {
      whatsapp: "WhatsApp",
      phone: "Telefone",
      email: "E-mail",
      sms: "SMS",
    };
    return labels[value] ?? value;
  }

  if (key === "whatsappRemindersEnabled") {
    return value === "true" ? "Ativado" : value === "false" ? "Desativado" : value;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.exec(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    }
  }
  return value;
}

function transformToPatientField(field?: PatientRecordField): PatientField | undefined {
  if (!field) return undefined;

  const hasValue =
    field.value !== null && field.value !== undefined && String(field.value).trim() !== "";
  const formattedValue = formatFieldValue(field.key, field.value);

  return {
    label: field.label,
    value: formattedValue,
    ...(field.required && !hasValue ? { isAlert: true } : {}),
    ...(field.required && !hasValue ? { helperText: "Campo obrigatório não preenchido" } : {}),
  };
}

function getFormErrorMessage(
  errors: UseFormReturn<PersonalInfoFormValues>["formState"]["errors"],
  key: string,
): string | undefined {
  const error = errors[key as keyof typeof errors];
  if (!error) return undefined;
  if (typeof error.message === "string" && error.message.trim() !== "") {
    return error.message;
  }
  return undefined;
}

function normalizeStreetType(street: string): string {
  if (!street) return street;

  // Replace "Avenida" (with or without space) with "Av."
  return street
    .replace(/^Avenida\s+/i, "Av. ")
    .replace(/^Avenida$/i, "Av.")
    .replace(/^Av\.\s*/i, "Av. ");
}

function formatCombinedAddress(
  street: string | null | undefined,
  number: string | null | undefined,
  complement: string | null | undefined,
): string {
  if (!street) return "";

  // Normalize street type
  const formattedStreet = normalizeStreetType(street);

  const parts: string[] = [formattedStreet];

  if (number?.trim()) {
    parts.push(number.trim());
  }

  if (complement?.trim()) {
    parts.push(complement.trim());
  }

  return parts.join(", ");
}

function EditablePersonalField({
  fieldKey,
  form,
  label,
  helperText,
  errorMessage,
}: {
  fieldKey: PersonalInfoFieldKey;
  form: UseFormReturn<PersonalInfoFormValues>;
  label?: string;
  helperText?: React.ReactNode;
  errorMessage?: string;
}) {
  const field = useV2ControllerField({
    control: form.control,
    name: fieldKey,
    mode: fieldKey === "whatsappRemindersEnabled" ? "raw" : "string",
  });

  if (fieldKey === "whatsappRemindersEnabled") {
    const toggledOn = coerceWhatsappSessionRemindersValue(field.field.value);
    return (
      <FluriFieldV2Switch
        label={label ?? ""}
        helperText={helperText}
        checked={toggledOn}
        onCheckedChange={(checked) => {
          field.field.onChange(checked);
        }}
        {...(errorMessage !== undefined ? { errorMessage } : {})}
      />
    );
  }
  const inputField = getV2InputProps(field.contract);

  if (fieldKey === "dateOfBirth") {
    return (
      <FluriFieldV2Birthdate
        field={inputField}
        fullWidth
        {...(label !== undefined ? { label } : {})}
        {...(helperText !== undefined ? { helperText } : {})}
        {...(errorMessage !== undefined ? { errorMessage } : {})}
      />
    );
  }

  if (fieldKey === "phone") {
    return (
      <FluriFieldV2Phone
        field={inputField}
        fullWidth
        {...(label !== undefined ? { label } : {})}
        {...(helperText !== undefined ? { helperText } : {})}
        {...(errorMessage !== undefined ? { errorMessage } : {})}
      />
    );
  }

  if (fieldKey === "cpf") {
    return (
      <FluriFieldV2Cpf
        field={inputField}
        fullWidth
        validateOnBlur
        {...(label !== undefined ? { label } : {})}
        {...(helperText !== undefined ? { helperText } : {})}
        {...(errorMessage !== undefined ? { errorMessage } : {})}
      />
    );
  }

  if (fieldKey === "preferredContactMethod") {
    return (
      <FluriFieldV2Select
        label={label ?? ""}
        options={[
          { label: "WhatsApp", value: "whatsapp" },
          { label: "Telefone", value: "phone" },
          { label: "E-mail", value: "email" },
          { label: "SMS", value: "sms" },
        ]}
        placeholder="Selecione um canal"
        field={getV2SelectProps(field.contract)}
        fullWidth
        {...(errorMessage !== undefined ? { errorMessage } : {})}
      />
    );
  }

  return (
    <FluriFieldV2Input
      field={inputField}
      fullWidth
      type={fieldKey === "email" ? "email" : "text"}
      {...(label !== undefined ? { label } : {})}
      {...(helperText !== undefined ? { helperText } : {})}
      {...(errorMessage !== undefined ? { errorMessage } : {})}
    />
  );
}

export function PatientDetailPersonalInfoSection({
  dataset,
  form,
  isEditing,
}: PatientDetailPersonalInfoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [combinedAddressValue, setCombinedAddressValue] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showSocialNameField, setShowSocialNameField] = useState(false);

  const sectionsById = Object.fromEntries(dataset.sections.map((section) => [section.id, section]));
  const allFields = GROUPS.flatMap((group) => group.fields);

  const initialFields = allFields;
  const extraFields: typeof allFields = [];
  const showExtra = isExpanded || isEditing;

  // Sync combined value when data changes or entering edit mode
  useEffect(() => {
    if (isEditing) {
      const formStreet = form.getValues("address");
      const formNumber = form.getValues("number");
      const formComplement = form.getValues("complement");
      const socialName = form.getValues("socialName");

      setShowSocialNameField(!!socialName && socialName.trim() !== "");

      const personalSection = sectionsById.personal;
      const contactSection = sectionsById.contact;
      const street =
        formStreet !== undefined && formStreet !== null && formStreet !== ""
          ? formStreet
          : (getField(personalSection, "address")?.value as string | null | undefined);
      const number =
        formNumber !== undefined && formNumber !== null && formNumber !== ""
          ? formNumber
          : (getField(contactSection, "number")?.value as string | null | undefined);
      const complement =
        formComplement !== undefined && formComplement !== null && formComplement !== ""
          ? formComplement
          : (getField(contactSection, "complement")?.value as string | null | undefined);

      if (street && typeof street === "string" && street.trim() !== "") {
        const combined = formatCombinedAddress(street, number, complement);
        setCombinedAddressValue(combined);
      } else {
        setCombinedAddressValue("");
      }
    } else {
      setCombinedAddressValue("");
    }
  }, [isEditing, dataset.sections, sectionsById, form]);

  const renderField = (fieldRef: (typeof allFields)[0], _index: number) => {
    const rawField = getField(sectionsById[fieldRef.section], fieldRef.key);
    const fieldErrorMessage = getFormErrorMessage(form.formState.errors, fieldRef.key);

    if (!rawField && fieldRef.key !== "address") return null;

    // View Mode: Special handling for socialName (only show if exists)
    if (!isEditing && fieldRef.key === "socialName") {
      const value = rawField?.value;
      if (!value || String(value).trim() === "") return null;
    }

    if (isEditing) {
      const isMandatory = ["firstName", "lastName", "dateOfBirth", "cpf"].includes(fieldRef.key);
      const isWhatsAppReminders = fieldRef.key === "whatsappRemindersEnabled";
      const label = `${rawField?.label ?? (fieldRef.key === "address" ? "Endereço" : fieldRef.key)}${isMandatory || isWhatsAppReminders ? "" : " (opcional)"}`;

      if (fieldRef.key === "address") {
        return (
          <div key={fieldRef.key}>
            <FluriFieldV2Input
              label={label}
              value={combinedAddressValue ?? ""}
              readOnly
              onClick={() => setIsAddressModalOpen(true)}
              placeholder="Clique para adicionar endereço"
              fullWidth={false}
              {...(fieldErrorMessage !== undefined ? { errorMessage: fieldErrorMessage } : {})}
              className="cursor-pointer"
            />
          </div>
        );
      }

      if (fieldRef.key === "firstName") {
        return (
          <EditablePersonalField
            key={fieldRef.key}
            fieldKey={fieldRef.key as PersonalInfoFieldKey}
            form={form}
            label={label}
            {...(fieldErrorMessage !== undefined ? { errorMessage: fieldErrorMessage } : {})}
            helperText={
              !showSocialNameField && !fieldErrorMessage ? (
                <BrandButton
                  variant="ghost"
                  onClick={() => setShowSocialNameField(true)}
                  className="text-[10px] font-medium text-primary hover:underline h-auto p-0"
                >
                  Adicionar nome social?
                </BrandButton>
              ) : null
            }
          />
        );
      }

      if (fieldRef.key === "socialName") {
        return (
          <AnimatePresence key={fieldRef.key}>
            {showSocialNameField && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <EditablePersonalField
                  fieldKey={fieldRef.key as PersonalInfoFieldKey}
                  form={form}
                  label="Nome social (opcional)"
                  {...(fieldErrorMessage !== undefined ? { errorMessage: fieldErrorMessage } : {})}
                />
              </motion.div>
            )}
          </AnimatePresence>
        );
      }

      return (
        <EditablePersonalField
          key={fieldRef.key}
          fieldKey={fieldRef.key as PersonalInfoFieldKey}
          form={form}
          label={label}
          {...(fieldErrorMessage !== undefined ? { errorMessage: fieldErrorMessage } : {})}
        />
      );
    }

    if (fieldRef.key === "address") {
      const personalSection = sectionsById.personal;
      const contactSection = sectionsById.contact;
      const street = getField(personalSection, "address")?.value as string | null | undefined;
      const number = getField(contactSection, "number")?.value as string | null | undefined;
      const complement = getField(contactSection, "complement")?.value as string | null | undefined;
      const neighborhood = getField(contactSection, "neighborhood")?.value;
      const city = getField(contactSection, "city")?.value;
      const state = getField(contactSection, "state")?.value;
      const postalCode = getField(contactSection, "postalCode")?.value;
      const country = getField(contactSection, "country")?.value;

      const fullDisplay = formatCombinedAddress(street, number, complement);
      const hasAddress = street && street.trim() !== "";

      const fullAddressForMap = hasAddress
        ? [street, number, neighborhood, city, state, postalCode, country]
            .filter(Boolean)
            .join(", ")
        : null;
      const mapUrl = fullAddressForMap
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressForMap)}`
        : null;

      return (
        <div key={fieldRef.key} className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Endereço</label>
          <div className="flex items-center gap-2 text-sm">
            <span className={fullDisplay ? "" : "text-muted-foreground"}>{fullDisplay || "—"}</span>
            {hasAddress && mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Ver no Google Maps"
              >
                <MapPin className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      );
    }

    const patientField = transformToPatientField(rawField);
    if (!patientField) return null;

    return <FieldDisplay key={fieldRef.key} field={patientField} />;
  };

  // Custom edit layout with better organization
  if (isEditing) {
    const personalSection = sectionsById.personal;
    const contactSection = sectionsById.contact;

    return (
      <div className="space-y-6">
        {/* Row 1: Name, Last Name, Date of Birth */}
        <div className="grid gap-x-2 gap-y-6 md:grid-cols-3">
          {renderField({ section: "personal", key: "firstName" }, 0)}
          {renderField({ section: "personal", key: "lastName" }, 1)}
          {renderField({ section: "personal", key: "dateOfBirth" }, 2)}
        </div>

        {/* Row 2: Phone (with country) and WhatsApp Switch */}
        <div className="grid gap-x-2 gap-y-6 md:grid-cols-2">
          {renderField({ section: "personal", key: "phone" }, 3)}
          {renderField({ section: "personal", key: "whatsappRemindersEnabled" }, 4)}
        </div>

        {/* Row 3: Email (full width) */}
        <div className="grid gap-x-2 gap-y-6 md:grid-cols-1">
          {renderField({ section: "personal", key: "email" }, 5)}
        </div>

        {/* Row 4: CPF and Address */}
        <div className="grid gap-x-2 gap-y-6 md:grid-cols-2">
          {renderField({ section: "personal", key: "cpf" }, 6)}
          {renderField({ section: "personal", key: "address" }, 7)}
        </div>

        <EditAddressModal
          open={isAddressModalOpen}
          onOpenChange={setIsAddressModalOpen}
          initialAddress={(() => {
            const street = getField(personalSection, "address")?.value as string | null | undefined;
            const number = getField(contactSection, "number")?.value as string | null | undefined;
            const complement = getField(contactSection, "complement")?.value as
              | string
              | null
              | undefined;
            const neighborhood = getField(contactSection, "neighborhood")?.value as
              | string
              | null
              | undefined;
            const city = getField(contactSection, "city")?.value as string | null | undefined;
            const state = getField(contactSection, "state")?.value as string | null | undefined;
            const postalCode = getField(contactSection, "postalCode")?.value as
              | string
              | null
              | undefined;
            const country = getField(contactSection, "country")?.value as string | null | undefined;

            return {
              ...(street !== undefined ? { street } : {}),
              ...(number !== undefined ? { number } : {}),
              ...(complement !== undefined ? { complement } : {}),
              ...(neighborhood !== undefined ? { neighborhood } : {}),
              ...(city !== undefined ? { city } : {}),
              ...(state !== undefined ? { state } : {}),
              ...(postalCode !== undefined ? { postalCode } : {}),
              ...(country !== undefined ? { country } : {}),
            };
          })()}
          onSave={(address) => {
            form.setValue("address", address.street ?? "");
            form.setValue("number", address.number ?? "");
            form.setValue("complement", address.complement ?? "");
            form.setValue("neighborhood", address.neighborhood ?? "");
            form.setValue("city", address.city ?? "");
            form.setValue("state", address.state ?? "");
            form.setValue("postalCode", address.postalCode ?? "");
            form.setValue("country", address.country ?? "Brasil");

            if (address.street?.trim()) {
              const combined = formatCombinedAddress(
                address.street,
                address.number,
                address.complement,
              );
              setCombinedAddressValue(combined);
            } else {
              setCombinedAddressValue("");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="grid gap-x-2 gap-y-6 md:grid-cols-3">
          {initialFields.map((field, index) => renderField(field, index))}
        </div>

        <AnimatePresence>
          {extraFields.length > 0 && showExtra && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid gap-x-2 gap-y-6 pt-4 md:grid-cols-3">
                {extraFields.map((field, index) => renderField(field, index + 9))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isEditing && extraFields.length > 0 && (
        <div className="flex justify-center pt-4">
          <BrandButton
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                Ver menos <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Ver mais <ChevronDown className="h-4 w-4" />
              </>
            )}
          </BrandButton>
        </div>
      )}
    </div>
  );
}
