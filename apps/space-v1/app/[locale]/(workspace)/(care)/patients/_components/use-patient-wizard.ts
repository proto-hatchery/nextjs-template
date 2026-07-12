"use client";

import {
  type Resolver,
  useForm,
  type UseFormReturn,
  zodResolver,
} from "@workspace/forms/react-hook-form";
import {
  createPatientAction,
  type CreatePatientRequest,
} from "@workspace/supabase-data/actions/patients/create-patient";
import { createPatientGuardianAction } from "@workspace/supabase-data/actions/patients/manage-patient-guardians";
import { getErrorMessage } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action-result";
import { queryKeys } from "@workspace/supabase-data/utils/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { type FullPatientFormValues, fullPatientSchema, STEPS_CONFIG } from "./full-patient-schema";

const parseDate = (value: string): string | null => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  const [, day, month, year] = match;
  if (!day || !month || !year) return null;
  return `${year}-${month}-${day}`;
};

const normalizeDateOfBirth = (value: string | null | undefined): string | undefined => {
  const raw = (value ?? "").trim();
  if (!raw) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  return parseDate(raw) ?? undefined;
};

export interface UsePatientWizardResult {
  form: UseFormReturn<FullPatientFormValues>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  hasTriedSubmit: boolean;
  setHasTriedSubmit: React.Dispatch<React.SetStateAction<boolean>>;
  showAddressFields: boolean;
  setShowAddressFields: React.Dispatch<React.SetStateAction<boolean>>;
  guardianFieldRef: React.RefObject<HTMLInputElement | null>;
  addressNumberFieldRef: React.RefObject<HTMLInputElement | null>;
  isMinor: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  handleFinalSubmit: () => Promise<void>;
}

export function usePatientWizard(onClose: () => void): UsePatientWizardResult {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(false);

  const guardianFieldRef = useRef<HTMLInputElement>(null);
  const addressNumberFieldRef = useRef<HTMLInputElement>(null);

  const form = useForm<FullPatientFormValues, unknown, FullPatientFormValues>({
    resolver: zodResolver(fullPatientSchema) as Resolver<FullPatientFormValues>,
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      manual_first_name: "",
      manual_last_name: "",
      manual_preferred_name: "",
      manual_phone: "",
      manual_date_of_birth: "",
      manual_cpf: "",
      manual_preferred_contact_method: "whatsapp",
      notifications_whatsapp_session_reminders: true,
      manual_patient_origin: "OUTRO",
      manual_is_minor: false,
      manual_email: "",
    },
  });

  const calculateAge = (dobString: string | null | undefined): number | null => {
    if (!dobString) return null;

    const isoDate = /^\d{2}\/\d{2}\/\d{4}$/.test(dobString) ? parseDate(dobString) : dobString;
    if (!isoDate) return null;

    const parts = isoDate.split("-").map(Number);
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    if (!year || !month || !day) return null;

    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const dateOfBirth = form.watch("manual_date_of_birth");
  const age = calculateAge(dateOfBirth);
  const isMinor = age !== null && age < 18;

  const handleNext = async () => {
    setHasTriedSubmit(true);
    if (currentStep >= STEPS_CONFIG.length - 1) return;

    const step = STEPS_CONFIG[currentStep];
    if (!step) return;
    const fieldsToValidate = step.fields as unknown as (keyof FullPatientFormValues)[];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setHasTriedSubmit(false);
      setCurrentStep((prev) => prev + 1);
    } else {
      const firstError = fieldsToValidate.find((field) => form.getFieldState(field).error);
      if (firstError) form.setFocus(firstError);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setHasTriedSubmit(false);
    }
  };

  const onActualSubmit = async (data: FullPatientFormValues) => {
    setIsSubmitting(true);
    try {
      const addr = data.manual_address;
      const hasAddressData =
        addr &&
        typeof addr === "object" &&
        (/(\d{8})/.test(String(addr.postalCode ?? "")) ||
          Boolean((addr.street ?? "").trim()) ||
          Boolean((addr.city ?? "").trim()) ||
          Boolean((addr.neighborhood ?? "").trim()));

      const address: CreatePatientRequest["address"] | undefined = hasAddressData
        ? {
            street: (addr.street ?? "").trim() || "",
            number: (addr.number ?? "").trim() || "",
            complement: (addr.complement ?? "").trim() || "",
            neighborhood: (addr.neighborhood ?? "").trim() || "",
            city: (addr.city ?? "").trim() || "",
            state: (addr.state ?? "").trim().toUpperCase().slice(0, 2) || "",
            zipCode: (addr.postalCode ?? "").replace(/\D/g, "").slice(0, 8) || "",
            country: (addr.country ?? "Brasil").trim() || "Brasil",
          }
        : undefined;

      const emergencyName = data.emergency_contact_name?.trim();
      const emergencyPhone = data.emergency_contact_phone?.trim();
      const emergencyContacts: CreatePatientRequest["emergencyContacts"] =
        emergencyName && emergencyPhone
          ? [
              {
                name: emergencyName,
                phone: emergencyPhone,
                relationship: (data.emergency_contact_relationship ?? "").trim() || "",
              },
            ]
          : undefined;

      const payload: CreatePatientRequest = {
        firstName: data.manual_first_name.trim(),
        lastName: (data.manual_last_name ?? "").trim() || undefined,
        preferredName: (data.manual_preferred_name ?? "").trim() || undefined,
        phone: (data.manual_phone ?? "").trim() || undefined,
        dateOfBirth: (() => {
          return normalizeDateOfBirth(data.manual_date_of_birth);
        })(),
        cpf: (data.manual_cpf ?? "").trim() || undefined,
        email: (data.manual_email ?? "").trim() || undefined,
        preferredContactMethod: data.manual_preferred_contact_method
          ? data.manual_preferred_contact_method.toLowerCase().trim()
          : undefined,
        notificationsWhatsappSessionReminders:
          data.notifications_whatsapp_session_reminders ?? true,
        patientOrigin: data.manual_patient_origin ?? undefined,
        address,
        emergencyContacts,
        defaultSessionPrice: undefined,
      };
      const createdPatient = unwrapActionResult(await createPatientAction(payload));

      const patientId = createdPatient.id;
      const guardianName = data.guardian_name?.trim();
      if (isMinor && guardianName) {
        try {
          unwrapActionResult(await createPatientGuardianAction({
            patientId,
            input: {
              fullName: guardianName,
              guardianType: "parent",
            },
          }));
        } catch {
          toast.warning(
            "Paciente criado, mas não foi possível cadastrar o responsável. Tente editar o paciente.",
          );
        }
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast.success("Paciente criado com sucesso!");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao criar paciente. Tente novamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    const step = STEPS_CONFIG[currentStep];
    if (!step) return;
    const fieldsToValidate = step.fields as unknown as (keyof FullPatientFormValues)[];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      await form.handleSubmit(onActualSubmit)();
    } else {
      const firstError = fieldsToValidate.find((field) => form.getFieldState(field).error);
      if (firstError) form.setFocus(firstError);
    }
  };

  const wizard: UsePatientWizardResult = {
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    hasTriedSubmit,
    setHasTriedSubmit,
    showAddressFields,
    setShowAddressFields,
    guardianFieldRef,
    addressNumberFieldRef,
    isMinor,
    handleNext,
    handleBack,
    handleFinalSubmit,
  };

  return wizard;
}
