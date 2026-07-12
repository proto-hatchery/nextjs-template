"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import {
  FluriPatientFieldV2,
  type FluriPatientFieldV2Option as UIPatientOption,
} from "@workspace/forms/components/specialized/v2/fluri-patient-field-v2";
import { useFormContext } from "@workspace/forms/react-hook-form";
import {
  getV2InputProps,
  getV2PatientProps,
  getV2SelectProps,
  useV2ControllerField,
} from "@workspace/forms/v2/rhf";
import { FluriFormDialogFooter } from "@workspace/brand/overlays/fluri-form-dialog-shell";

import { type CreateDocumentFormValues, type CreateDocumentInput } from "./create-document-schema";

interface DocumentTemplateOption {
  id: string;
  title: string;
}

interface CreateDocumentFormProps {
  patientId: string;
  patientOptions: UIPatientOption[];
  templates: DocumentTemplateOption[];
  isPendingTemplates: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateDocumentInput) => void;
}

export function CreateDocumentForm({
  patientId,
  patientOptions,
  templates,
  isPendingTemplates,
  isSubmitting,
  onCancel,
  onSubmit,
}: CreateDocumentFormProps) {
  const { control, handleSubmit } = useFormContext<CreateDocumentFormValues>();

  const patientField = useV2ControllerField({
    control,
    name: "patientId",
    mode: "optional-select",
  });
  const templateField = useV2ControllerField({
    control,
    name: "templateId",
    mode: "optional-select",
  });
  const titleField = useV2ControllerField({
    control,
    name: "title",
    mode: "string",
  });

  const hasTemplates = templates.length > 0;
  const templatePlaceholder = isPendingTemplates
    ? "Carregando modelos..."
    : hasTemplates
      ? "Selecione o modelo"
      : "Nenhum modelo disponível";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="space-y-4 px-5 py-4">
        <FluriPatientFieldV2
          label="Paciente"
          options={patientOptions}
          field={getV2PatientProps(patientField.contract)}
          disabled={Boolean(patientId) || patientField.contract.disabled === true}
          fullWidth
        />

        <FluriFieldV2Select
          label="Modelo"
          options={templates.map((template) => ({ value: template.id, label: template.title }))}
          placeholder={templatePlaceholder}
          field={getV2SelectProps(templateField.contract)}
          disabled={isPendingTemplates || !hasTemplates || templateField.contract.disabled === true}
          required
          fullWidth
        />

        <FluriFieldV2Input
          label="Título do Documento"
          placeholder="Ex: Relatório de Evolução"
          field={getV2InputProps(titleField.contract)}
          required
          fullWidth
          disabled={titleField.contract.disabled === true}
        />
      </div>

      <FluriFormDialogFooter
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        submitLabel="Gerar Documento"
      />
    </form>
  );
}
