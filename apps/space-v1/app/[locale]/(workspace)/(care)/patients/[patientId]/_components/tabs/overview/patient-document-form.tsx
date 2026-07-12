"use client";

import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2FileUpload } from "@workspace/forms/components/specialized/v2/fluri-field-v2-file-upload";
import { useFormContext } from "@workspace/forms/react-hook-form";
import { getV2InputProps, useV2ControllerField } from "@workspace/forms/v2/rhf";
import { Label } from "@workspace/ui/components/label";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Info, Loader2 } from "lucide-react";

import { type PatientDocumentFormValues } from "./patient-document-schema";

interface PatientDocumentFormProps {
  onCancel: () => void;
  isSubmitting: boolean;
  onSubmit: (data: PatientDocumentFormValues) => void;
}

export function PatientDocumentForm({
  onCancel,
  isSubmitting,
  onSubmit,
}: PatientDocumentFormProps) {
  const { control, handleSubmit, formState, watch } = useFormContext<PatientDocumentFormValues>();

  const nameField = useV2ControllerField({
    control,
    name: "name",
    mode: "string",
  });

  const selectedFile = watch("file");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(onSubmit)(e);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do documento</Label>
          <FluriFieldV2Input
            id="name"
            placeholder="Ex.: Encaminhamento médico, Exames de sangue..."
            field={getV2InputProps(nameField.contract)}
            disabled={nameField.contract.disabled}
            className="bg-muted/50 border-none"
            fullWidth
          />
          {formState.errors.name && (
            <p className="text-xs text-destructive">{formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <FluriFieldV2FileUpload
            name="file"
            label="Arquivo"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.odt"
            maxSize={10 * 1024 * 1024} // 10MB - será comprimido automaticamente se necessário
            required
            helperText={
              selectedFile
                ? `Arquivo selecionado: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : "PDFs, imagens (JPG, PNG), Word (.doc, .docx), TXT ou ODT. Imagens grandes serão comprimidas automaticamente."
            }
          />
        </div>

        {/* Info sobre compressão automática */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Compressão automática</p>
            <p className="text-blue-600">
              Imagens acima de 5MB serão automaticamente comprimidas para garantir um upload rápido.
              PDFs devem ter no máximo 10MB.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <BrandButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </BrandButton>
        <BrandButton type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-3 animate-spin mr-2" />}
          Salvar documento
        </BrandButton>
      </div>
    </form>
  );
}
