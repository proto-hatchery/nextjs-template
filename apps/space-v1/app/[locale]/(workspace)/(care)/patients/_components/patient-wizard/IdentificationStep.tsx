"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Switch } from "@workspace/forms/components/base/v2/fluri-field-v2-switch";
import {
  FluriFieldV2Birthdate,
  FluriFieldV2Cpf,
  FluriFieldV2Phone,
} from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { useFormContext } from "@workspace/forms/react-hook-form";
import { resolveV2FieldError } from "@workspace/forms/v2/kernel";
import { getV2InputProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface IdentificationStepProps {
  hasTriedSubmit: boolean;
  isMinor: boolean;
  onDateComplete: () => void;
  guardianFieldRef: React.RefObject<HTMLInputElement | null>;
}

export function IdentificationStep({
  hasTriedSubmit,
  isMinor,
  onDateComplete,
  guardianFieldRef,
}: IdentificationStepProps) {
  const { control, clearErrors, setValue, watch } = useFormContext();
  const [showPreferredName, setShowPreferredName] = useState(false);

  const firstNameField = useV2ControllerField({
    control,
    name: "manual_first_name",
    mode: "string",
  });
  const lastNameField = useV2ControllerField({
    control,
    name: "manual_last_name",
    mode: "string",
  });
  const preferredNameField = useV2ControllerField({
    control,
    name: "manual_preferred_name",
    mode: "string",
  });
  const phoneField = useV2ControllerField({
    control,
    name: "manual_phone",
    mode: "string",
  });
  const cpfField = useV2ControllerField({
    control,
    name: "manual_cpf",
    mode: "string",
  });
  const birthdateField = useV2ControllerField({
    control,
    name: "manual_date_of_birth",
    mode: "string",
  });
  const guardianField = useV2ControllerField({
    control,
    name: "guardian_name",
    mode: "string",
  });
  const whatsappRemindersEnabled = Boolean(watch("notifications_whatsapp_session_reminders"));

  const birthdateError = hasTriedSubmit
    ? (resolveV2FieldError(birthdateField.contract.error) as string | undefined)
    : undefined;

  return (
    <div className="space-y-6 pt-1 animate-in fade-in-50 slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="space-y-1">
            <FluriFieldV2Input
              label="Nome"
              placeholder="Ex: Maria Luiza"
              required
              autoFocus
              field={getV2InputProps(firstNameField.contract)}
              fullWidth
            />
            {!showPreferredName && (
              <div className="px-1">
                <BrandButton
                  variant="ghost"
                  onClick={() => setShowPreferredName(true)}
                  className="text-[10px] font-medium text-primary hover:underline h-auto p-0"
                >
                  Adicionar nome preferido?
                </BrandButton>
              </div>
            )}
          </div>

          <FluriFieldV2Input
            label="Sobrenome"
            placeholder="Ex: Silva Santos"
            field={getV2InputProps(lastNameField.contract)}
            fullWidth
          />
        </div>

        <AnimatePresence>
          {showPreferredName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-2 w-full md:w-1/2">
                <FluriFieldV2Input
                  label="Nome preferido"
                  placeholder="Ex: Joana"
                  field={getV2InputProps(preferredNameField.contract)}
                  helperText="Tem prioridade na formação do nome de exibição"
                  autoFocus
                  fullWidth
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FluriFieldV2Phone
          label="Telefone"
          required
          field={getV2InputProps(phoneField.contract)}
          fullWidth
        />

        <FluriFieldV2Switch
          label="Receber lembretes por WhatsApp"
          helperText="Permite o envio automático de lembretes de consulta via WhatsApp."
          checked={whatsappRemindersEnabled}
          onCheckedChange={(checked) => {
            setValue("notifications_whatsapp_session_reminders", checked, {
              shouldDirty: true,
            });
          }}
        />

        <FluriFieldV2Cpf
          label="CPF"
          placeholder="000.000.000-00"
          field={getV2InputProps(cpfField.contract)}
          fullWidth
          validateOnBlur
        />

        <FluriFieldV2Birthdate
          label="Data de Nascimento"
          placeholder="dd/mm/aaaa"
          field={getV2InputProps(birthdateField.contract)}
          onValueChange={(val) => {
            if (hasTriedSubmit && birthdateError) {
              clearErrors("manual_date_of_birth");
            }
            if (val.length === 10) {
              onDateComplete();
            }
          }}
          fullWidth
        />

        <AnimatePresence>
          {isMinor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-visible"
            >
              <div className="py-1">
                <FluriFieldV2Input
                  inputRef={guardianFieldRef}
                  label="Nome do Responsável"
                  placeholder="Nome completo do responsável"
                  field={getV2InputProps(guardianField.contract)}
                  helperText="Conforme orientações do CFP, é necessário informar o nome do responsável para pacientes menores de idade"
                  fullWidth
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
