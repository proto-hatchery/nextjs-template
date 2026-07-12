"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriPatientFieldV2 } from "@workspace/forms/components/specialized/v2/fluri-patient-field-v2";
import {
  Controller,
  type FieldErrors,
  useForm,
  zodResolver,
} from "@workspace/forms/react-hook-form";
import { formatBrazilianPhone } from "@workspace/forms/utils/phone";
import { getV2InputProps, getV2PatientProps, getV2SelectProps } from "@workspace/forms/v2/rhf";
import { createGeneratedDocumentAction } from "@workspace/supabase-data/actions/documents/create-generated-document";
import { useDocumentTemplates } from "@workspace/supabase-data/hooks/documents";
import { usePatients as usePsychologistPatients } from "@workspace/supabase-data/hooks/patients";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { BrandButton } from "@workspace/brand/components/brand-button";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Description,
  FluriDialogV2Footer,
  FluriDialogV2Title,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const createDocumentSchema = z.object({
  templateId: z.string().min(1, "Selecione um modelo"),
  patientId: z.string().min(1, "Selecione um paciente"),
  title: z.string().min(2, "Título é obrigatório"),
});

type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

// Schema for create generated document action response
const SubstitutionWarningSchema = z.object({
  variable: z.string(),
  message: z.string(),
  replacedWith: z.string().optional(),
});

const CreateGeneratedDocumentSchema = z.object({
  document: z.object({
    id: z.string(),
  }),
  warnings: z.array(SubstitutionWarningSchema),
});

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTemplateId?: string;
}

export function CreateDocumentModal({
  open,
  onOpenChange,
  defaultTemplateId,
}: CreateDocumentModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      templateId: defaultTemplateId ?? "",
      patientId: "",
      title: "",
    },
  });

  const { data: patients = [], isPending: isPendingPatients } = usePsychologistPatients();
  const { data: templates = [], isPending: isPendingTemplates } = useDocumentTemplates();

  // Update form when defaultTemplateId changes
  useEffect(() => {
    if (!open || !defaultTemplateId || isPendingTemplates) {
      return;
    }

    const templateStillExists = templates.some((template) => template.id === defaultTemplateId);
    if (templateStillExists) {
      form.setValue("templateId", defaultTemplateId);
    } else {
      form.setValue("templateId", "");
      toast.warning("O modelo pré-selecionado foi atualizado. Selecione novamente.");
    }
  }, [defaultTemplateId, form, isPendingTemplates, open, templates]);

  const patientOptions = useMemo(
    () =>
      patients.map((p) => {
        const phone = p.phone;
        let formattedPhone: string | null = null;

        if (phone) {
          if (phone.includes("+55") || phone.startsWith("55")) {
            const digitsOnly = phone.replace(/\D/g, "");
            const brazilianDigits = digitsOnly.startsWith("55") ? digitsOnly.slice(2) : digitsOnly;

            if (brazilianDigits.length === 10 || brazilianDigits.length === 11) {
              const formatted = formatBrazilianPhone(brazilianDigits);
              formattedPhone = typeof formatted === "string" ? formatted : phone;
            } else {
              formattedPhone = phone;
            }
          } else {
            formattedPhone = phone;
          }
        }

        return {
          id: p.id,
          name: p.displayName ?? p.full_name ?? "Paciente sem nome",
          subtitle: formattedPhone ?? "Sem telefone cadastrado",
          status: "active" as const,
        };
      }),
    [patients],
  );

  const hasPatients = patients.length > 0;
  const hasTemplates = templates.length > 0;
  const patientPlaceholder = isPendingPatients
    ? "Carregando pacientes..."
    : hasPatients
      ? "Selecione o paciente"
      : "Nenhum paciente disponível";
  const templatePlaceholder = isPendingTemplates
    ? "Carregando modelos..."
    : hasTemplates
      ? "Selecione o modelo"
      : "Nenhum modelo disponível";

  // Check form validity
  const _isValid = form.formState.isValid;
  const _errors = form.formState.errors;

  const isSubmitDisabled = isSubmitting || !hasPatients || !hasTemplates;

  const handleSubmit = async (data: CreateDocumentInput) => {
    setIsSubmitting(true);
    try {
      const serialized = await createGeneratedDocumentAction({
        patientId: data.patientId,
        templateId: data.templateId,
        title: data.title,
      });
      const result = unwrapActionResult(serialized, CreateGeneratedDocumentSchema);

      const { document, warnings } = result;

      if (warnings.length > 0) {
        const warningMessages = warnings
          .map((w) =>
            typeof w === "string" ? w : w instanceof Error ? w.message : "Aviso desconhecido",
          )
          .join(", ");
        toast.warning(
          `Documento criado, mas alguns campos não puderam ser preenchidos: ${warningMessages}`,
        );
      } else {
        toast.success("Documento gerado com sucesso!");
      }

      form.reset({
        templateId: "",
        patientId: "",
        title: "",
      });

      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["psychologist_generated_documents"] });
      void queryClient.invalidateQueries({
        queryKey: ["psychologist_generated_documents", data.patientId],
      });

      router.replace(`/documents/${document.id}/edit`);
    } catch (error) {
      if (isActionError(error)) {
        toast.error(error.message || "Erro ao gerar documento");
      } else {
        toast.error("Erro ao gerar documento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting) {
      return;
    }
    onOpenChange(newOpen);
  };

  const onFormError = (_errors: FieldErrors<CreateDocumentInput>) => {
    toast.error("Por favor, verifique os campos obrigatórios.");
  };

  return (
    <FluriDialogV2 open={open} onOpenChange={handleOpenChange}>
      <FluriDialogV2Content
        className="sm:max-w-[560px] gap-0 overflow-hidden rounded-3xl p-0"
        showCloseButton={false}
        title="Gerar Novo Documento"
        description="Selecione modelo, paciente e título para gerar o documento com preenchimento automático."
        hideTitle
        onInteractOutside={(e: { preventDefault: () => void }) => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e: { preventDefault: () => void }) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-2">
          <div className="min-w-[44px]" />
          <div className="flex items-center justify-center px-2">
            <div className="truncate text-center text-base font-semibold text-foreground">
              Gerar documento
            </div>
          </div>
          <div className="flex min-w-[44px] items-center justify-end">
            <BrandButton
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleOpenChange(false)}
              className="mr-1 mt-2 bg-accent hover:bg-accent/80"
              aria-label="Fechar"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </BrandButton>
          </div>
        </div>

        <div className="px-5 pb-3 pt-2">
          <FluriDialogV2Title>Gerar Novo Documento</FluriDialogV2Title>
          <FluriDialogV2Description>
            Selecione modelo, paciente e título para gerar o documento com preenchimento automático.
          </FluriDialogV2Description>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit(handleSubmit, onFormError)(e);
          }}
          className="space-y-4 px-5 pb-5"
        >
          <Controller
            name="patientId"
            control={form.control}
            render={({ field, fieldState }) => {
              const patientProps = getV2PatientProps({
                value: field.value,
                onValueChange: field.onChange,
                onBlur: field.onBlur,
                name: field.name,
                ref: field.ref,
                error: fieldState.error,
              });
              const patientErrorMessage =
                typeof patientProps.errorMessage === "string"
                  ? patientProps.errorMessage
                  : form.formState.errors.patientId?.message;

              return (
                <FluriPatientFieldV2
                  label="Paciente"
                  placeholder={patientPlaceholder}
                  options={patientOptions}
                  field={patientProps}
                  {...(patientErrorMessage !== undefined
                    ? { errorMessage: patientErrorMessage }
                    : {})}
                  disabled={(patientProps.disabled ?? false) || isPendingPatients || !hasPatients}
                  fullWidth
                />
              );
            }}
          />

          <Controller
            name="templateId"
            control={form.control}
            render={({ field, fieldState }) => {
              const templateProps = getV2SelectProps({
                value: field.value,
                onValueChange: field.onChange,
                onBlur: field.onBlur,
                name: field.name,
                ref: field.ref,
                error: fieldState.error,
              });

              return (
                <FluriFieldV2Select
                  label="Modelo"
                  options={templates.map((template) => ({
                    value: template.id,
                    label: template.title,
                  }))}
                  placeholder={templatePlaceholder}
                  field={templateProps}
                  disabled={
                    (templateProps.disabled ?? false) || isPendingTemplates || !hasTemplates
                  }
                  {...(fieldState.error?.message !== undefined
                    ? { errorMessage: fieldState.error.message }
                    : {})}
                  required
                  fullWidth
                />
              );
            }}
          />

          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => {
              const titleProps = getV2InputProps({
                value: field.value,
                onValueChange: field.onChange,
                onBlur: field.onBlur,
                name: field.name,
                ref: field.ref,
                error: fieldState.error,
              });
              const titleErrorMessage = fieldState.error?.message;

              return (
                <FluriFieldV2Input
                  label="Título do Documento"
                  placeholder="Ex: Relatório de Evolução"
                  field={titleProps}
                  {...(titleErrorMessage !== undefined ? { errorMessage: titleErrorMessage } : {})}
                  required
                  fullWidth
                  autoComplete="off"
                />
              );
            }}
          />

          <FluriDialogV2Footer className="grid grid-cols-3 items-center px-0 pb-0 pt-1">
            <div />
            <div />
            <div className="mb-2 mr-1 flex items-center justify-end gap-2">
              <BrandButton
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </BrandButton>
              <BrandButton type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Gerando..." : "Gerar Documento"}
              </BrandButton>
            </div>
          </FluriDialogV2Footer>
        </form>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
