import { parseDate } from "@workspace/forms/fields/utils/date-formatting";
import { useForm } from "@workspace/forms/react-hook-form";
import { buildPhoneChangeDetails } from "@workspace/forms/utils/phone";
import { isValidCpf } from "@workspace/forms/utils/validation";
import type { UpdatePatientInput } from "@workspace/supabase-data/types/entities";
import { updatePatientAction } from "@workspace/supabase-data/actions/patients/update-patient";
import { usePatientClinicalData } from "@workspace/supabase-data/hooks/patients";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { coerceWhatsappSessionRemindersValue } from "../../../_utils/mapper";
import type { PatientRecordCollections, PatientRecordSection } from "../../../types";
import { PatientDetailSubheader } from "../../shared/patient-detail-subheader";
import { PatientClinicalConditionsCard } from "../clinical-data/patient-clinical-conditions-card";
import { PatientDetailPersonalInfoSection } from "./patient-detail-personal-info-section";
import { PatientEmergencyContactsCard } from "./patient-emergency-contacts-card";
import { PatientMedicalContactsCard } from "./patient-medical-contacts-card";

interface PatientDetailOverviewProps {
  data: PatientRecordCollections;
}

interface OverviewFormValues {
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

type OverviewFormField = keyof OverviewFormValues;

const ADDRESS_FIELD_KEYS = [
  "address",
  "number",
  "complement",
  "neighborhood",
  "city",
  "state",
  "postalCode",
  "country",
] as const satisfies readonly OverviewFormField[];

function isAddressField(key: OverviewFormField): key is (typeof ADDRESS_FIELD_KEYS)[number] {
  return (ADDRESS_FIELD_KEYS as readonly string[]).includes(key);
}

function toTrimmedString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
}

export function PatientDetailOverview({ data }: PatientDetailOverviewProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams();
  const patientId = params?.patientId as string;

  // Fetch clinical data
  const { data: clinicalData, isPending: isPendingClinicalData } =
    usePatientClinicalData(patientId);

  // We need to ensure ALL fields are in defaultValues, not just the ones in GROUPS,
  // especially the address parts that might be hidden from the UI list.
  const allSectionFields = useMemo(
    () => data.sections.flatMap((s: PatientRecordSection) => s.fields),
    [data.sections],
  );

  const defaultValues = useMemo(() => {
    return allSectionFields.reduce(
      (acc, field) => {
        // Convert empty strings to undefined for address fields to avoid showing default values
        const value = field.value;
        if (field.key in acc) {
          const typedKey = field.key as OverviewFormField;
          const nextValues = acc as Record<OverviewFormField, string | boolean | undefined>;
          if (isAddressField(typedKey) && (value === "" || value === null)) {
            nextValues[typedKey] = undefined as (typeof nextValues)[typeof typedKey];
          } else if (typedKey === "whatsappRemindersEnabled") {
            nextValues[typedKey] = coerceWhatsappSessionRemindersValue(value);
          } else if (typeof value === "string") {
            nextValues[typedKey] = value;
          } else if (value === null || value === undefined) {
            nextValues[typedKey] = undefined as (typeof nextValues)[typeof typedKey];
          } else {
            nextValues[typedKey] = String(value);
          }
        }
        return acc;
      },
      {
        firstName: undefined,
        lastName: undefined,
        socialName: undefined,
        email: undefined,
        phone: undefined,
        preferredContactMethod: undefined,
        whatsappRemindersEnabled: true,
        dateOfBirth: undefined,
        cpf: undefined,
        address: undefined,
        number: undefined,
        complement: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
        postalCode: undefined,
        country: undefined,
      } satisfies OverviewFormValues,
    );
  }, [allSectionFields]);

  const form = useForm<OverviewFormValues>({
    defaultValues,
  });

  // Reset form when data changes (e.g. after save)
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const validateFormData = (formData: OverviewFormValues) => {
    let hasErrors = false;
    const setFieldError = (field: OverviewFormField, message: string) => {
      hasErrors = true;
      form.setError(field, { type: "manual", message });
    };

    // Mandatory fields: Name, Last Name, Date of Birth, CPF
    if (!formData.firstName || toTrimmedString(formData.firstName) === "") {
      setFieldError("firstName", "Nome é obrigatório.");
    }

    if (!formData.lastName || toTrimmedString(formData.lastName) === "") {
      setFieldError("lastName", "Sobrenome é obrigatório.");
    }

    const dobValue = toTrimmedString(formData.dateOfBirth);
    if (!dobValue || dobValue === "") {
      setFieldError("dateOfBirth", "Data de nascimento é obrigatória.");
    } else {
      // Allow both DD/MM/YYYY (UI) and YYYY-MM-DD (Database)
      const isUiFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(dobValue);
      const isDbFormat = /^\d{4}-\d{2}-\d{2}$/.test(dobValue);

      if (!isUiFormat && !isDbFormat) {
        setFieldError("dateOfBirth", "Data de nascimento inválida.");
      } else {
        // Further validation using parseDate for UI format
        if (isUiFormat && !parseDate(dobValue)) {
          setFieldError("dateOfBirth", "Data de nascimento inválida.");
        }
      }
    }

    const cpfValue = toTrimmedString(formData.cpf);
    if (!cpfValue || cpfValue === "") {
      setFieldError("cpf", "CPF é obrigatório.");
    } else {
      const digitsOnly = cpfValue.replace(/\D/g, "");
      if (!isValidCpf(digitsOnly)) {
        setFieldError("cpf", "CPF inválido.");
      }
    }

    const emailValue = toTrimmedString(formData.email);
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setFieldError("email", "E-mail inválido.");
    }

    const phoneValue = toTrimmedString(formData.phone);
    if (phoneValue) {
      const fallbackCountry = phoneValue.startsWith("+") ? undefined : "BR";
      const phoneDetails = buildPhoneChangeDetails(phoneValue, fallbackCountry, "international");

      if (!phoneDetails.isValid && !phoneDetails.isPossible) {
        setFieldError("phone", "Telefone inválido para o país informado.");
      }
    }

    return !hasErrors;
  };

  const applyServerError = (errorMessage: string) => {
    const normalizedMessage = errorMessage.toLowerCase();
    const map: { pattern: RegExp; field: OverviewFormField; message: string }[] = [
      { pattern: /cpf/, field: "cpf", message: "Erro no CPF informado." },
      { pattern: /telefone|phone|celular/, field: "phone", message: "Erro no telefone informado." },
      { pattern: /e-?mail|email/, field: "email", message: "Erro no e-mail informado." },
      {
        pattern: /data.*nascimento|birth|date/,
        field: "dateOfBirth",
        message: "Erro na data de nascimento informada.",
      },
      {
        pattern: /nome|first_name/,
        field: "firstName",
        message: "Erro no nome informado.",
      },
      {
        pattern: /sobrenome|last_name/,
        field: "lastName",
        message: "Erro no sobrenome informado.",
      },
      {
        pattern: /endere|address|cep|postal/,
        field: "address",
        message: "Erro no endereço informado.",
      },
    ];

    const mapped = map.find(({ pattern }) => pattern.test(normalizedMessage));
    if (mapped) {
      form.setError(mapped.field, { type: "server", message: mapped.message });
    }

    form.setError("root.serverError", {
      type: "server",
      message: errorMessage || "Erro ao atualizar dados.",
    });
  };

  const handleSave = async (formData: OverviewFormValues) => {
    try {
      form.clearErrors();
      const isValid = validateFormData(formData);
      if (!isValid) {
        toast.error("Verifique os campos com erro e tente novamente.");
        return;
      }

      const hasAddressData = ADDRESS_FIELD_KEYS.some((key) => {
        const value = formData[key];
        return typeof value === "string" && value.trim().length > 0;
      });

      // Convert UI date (DD/MM/YYYY) to database date (YYYY-MM-DD)
      const rawDob = formData.dateOfBirth;
      const formattedDob =
        rawDob && /^\d{2}\/\d{2}\/\d{4}$/.test(rawDob) ? parseDate(rawDob) : rawDob;
      const trimmedSocialName = formData.socialName?.trim();
      const trimmedDob = formattedDob?.trim();
      const trimmedCpf = formData.cpf?.trim();

      const updateInput: UpdatePatientInput = {
        ...(formData.firstName !== undefined ? { firstName: formData.firstName } : {}),
        ...(formData.lastName !== undefined ? { lastName: formData.lastName } : {}),
        ...(trimmedSocialName ? { preferredName: trimmedSocialName } : {}),
        ...(formData.email !== undefined ? { email: formData.email } : {}),
        ...(formData.phone !== undefined ? { phone: formData.phone } : {}),
        ...(formData.preferredContactMethod !== undefined
          ? { preferredContactMethod: formData.preferredContactMethod }
          : {}),
        notificationsWhatsappSessionReminders: formData.whatsappRemindersEnabled,
        ...(trimmedDob ? { dateOfBirth: trimmedDob } : {}),
        ...(trimmedCpf ? { cpf: trimmedCpf } : {}),
        ...(hasAddressData
          ? {
              address: {
                street: formData.address ?? "",
                number: formData.number ?? "",
                ...(formData.complement?.trim() ? { complement: formData.complement.trim() } : {}),
                neighborhood: formData.neighborhood ?? "",
                city: formData.city ?? "",
                state: formData.state ?? "",
                postalCode: formData.postalCode ?? "",
                country: formData.country ?? "Brasil",
              },
            }
          : {}),
      };
      setIsSaving(true);
      unwrapActionResult(await updatePatientAction({
        patientId,
        ...updateInput,
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });

      form.clearErrors();
      toast.success("Dados atualizados com sucesso!");
      setIsEditing(false);
    } catch (error) {
      const message = getErrorMessage(error, "Erro ao atualizar dados.");
      applyServerError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PatientDetailSubheader title="Informações pessoais">
        {!isEditing ? (
          <BrandButton
            variant="ghost"
            size="sm"
            family="rounded"
            onClick={() => setIsEditing(true)}
            aria-label="Editar informações"
          >
            Editar
          </BrandButton>
        ) : (
          <div className="flex gap-2">
            <BrandButton
              variant="ghost"
              size="sm"
              family="rounded"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancelar
            </BrandButton>
            <BrandButton
              variant="ghost"
              size="sm"
              family="rounded"
              onClick={() => {
                void form.handleSubmit(handleSave, (_errors) => {
                  toast.error("Por favor, corrija os erros no formulário.");
                })();
              }}
              disabled={isSaving}
            >
              Salvar
            </BrandButton>
          </div>
        )}
      </PatientDetailSubheader>
      {isEditing &&
      typeof form.formState.errors.root?.serverError?.message === "string" &&
      form.formState.errors.root.serverError.message ? (
        <div className="text-sm text-destructive px-1">
          {form.formState.errors.root.serverError.message}
        </div>
      ) : null}

      {/* Personal Information */}
      <PatientDetailPersonalInfoSection dataset={data} form={form} isEditing={isEditing} />

      {/* Emergency Contacts */}
      <PatientEmergencyContactsCard patientId={patientId} />

      {/* Medical Contacts */}
      <PatientMedicalContactsCard patientId={patientId} />

      {/* Medical Conditions and Medications */}
      <PatientClinicalConditionsCard
        patientId={patientId}
        clinicalData={clinicalData ?? null}
        isPending={isPendingClinicalData}
      />
    </div>
  );
}
