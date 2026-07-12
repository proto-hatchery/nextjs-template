"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatBrazilianPhone } from "@workspace/forms/utils/phone";
import { createGeneratedDocumentAction } from "@workspace/supabase-data/actions/documents/create-generated-document";
import { useDocumentTemplates } from "@workspace/supabase-data/hooks/documents";
import { usePatients as usePsychologistPatients } from "@workspace/supabase-data/hooks/patients";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResult } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { VisuallyHidden } from "@workspace/ui/lib/visually-hidden";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { UserAvatar } from "@workspace/brand/patterns/user-avatar";
import { ChevronLeft, ChevronRight, FileText, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

type Step = "template" | "patient" | "title";

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

interface CreateDocumentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTemplateId?: string;
}

export function CreateDocumentSheet({
  open,
  onOpenChange,
  defaultTemplateId,
}: CreateDocumentSheetProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<Step>("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(
    defaultTemplateId,
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: patients = [], isPending: isPendingPatients } = usePsychologistPatients();
  const { data: templates = [], isPending: isPendingTemplates } = useDocumentTemplates();

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId],
  );

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      if (defaultTemplateId) {
        setSelectedTemplateId(defaultTemplateId);
        setCurrentStep("patient");
      } else {
        setCurrentStep("template");
      }
      setSelectedPatientId("");
      setTitle("");
    }
  }, [defaultTemplateId, open]);

  useEffect(() => {
    if (!open || !selectedTemplateId || isPendingTemplates) {
      return;
    }

    const templateStillExists = templates.some((template) => template.id === selectedTemplateId);
    if (!templateStillExists) {
      setSelectedTemplateId(undefined);
      setCurrentStep("template");
      toast.warning("O modelo selecionado foi atualizado. Selecione novamente.");
    }
  }, [isPendingTemplates, open, selectedTemplateId, templates]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentStep("patient");
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentStep("title");
  };

  const handleBack = () => {
    if (currentStep === "patient") {
      setCurrentStep("template");
    } else if (currentStep === "title") {
      setCurrentStep("patient");
    }
  };

  const handleSubmit = async () => {
    if (!selectedTemplateId || !selectedPatientId || !title.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const serialized = await createGeneratedDocumentAction({
        patientId: selectedPatientId,
        templateId: selectedTemplateId,
        title,
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

      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["psychologist_generated_documents"] });
      void queryClient.invalidateQueries({
        queryKey: ["psychologist_generated_documents", selectedPatientId],
      });

      router.replace(`/documents/${document.id}/edit`);
    } catch (error) {
      if (isActionError(error)) {
        toast.error(error.message || "Erro ao gerar documento");
      } else {
        toast.error("Erro ao gerar documento");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const patientOptions = useMemo(
    () =>
      patients.map((p) => {
        const phone = p.phone;
        let formattedPhone: string | null = null;

        if (phone) {
          const digitsOnly = phone.replace(/\D/g, "");
          const brazilianDigits = digitsOnly.startsWith("55") ? digitsOnly.slice(2) : digitsOnly;

          if (brazilianDigits.length === 10 || brazilianDigits.length === 11) {
            const formatted = formatBrazilianPhone(brazilianDigits);
            formattedPhone = typeof formatted === "string" ? formatted : phone;
          } else {
            formattedPhone = phone;
          }
        }

        return {
          id: p.id,
          name: p.displayName ?? p.full_name ?? "Paciente sem nome",
          subtitle: formattedPhone ?? "Sem telefone cadastrado",
        };
      }),
    [patients],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 pb-safe rounded-t-3xl h-[85vh]">
        <VisuallyHidden.Root>
          <SheetTitle>Gerar Novo Documento</SheetTitle>
        </VisuallyHidden.Root>

        {/* Header with back button and progress */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {currentStep !== "template" && (
              <BrandButton
                onClick={handleBack}
                variant="ghost"
                size="icon-sm"
                className="-ml-2"
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-5 w-5" />
              </BrandButton>
            )}
            <div className="flex-1">
              <h2 className="text-lg font-bold">
                {currentStep === "template" && "Selecione o Modelo"}
                {currentStep === "patient" && "Selecione o Paciente"}
                {currentStep === "title" && "Defina o Título"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === "template" && "Escolha um modelo de documento"}
                {currentStep === "patient" && "Para quem será o documento?"}
                {currentStep === "title" && "Dê um nome para o documento"}
              </p>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex gap-1.5 mt-4">
            <div
              className={cn(
                "h-1 flex-1 rounded-full",
                currentStep === "template" ? "bg-primary" : "bg-muted",
              )}
            />
            <div
              className={cn(
                "h-1 flex-1 rounded-full",
                currentStep === "patient" ? "bg-primary" : "bg-muted",
              )}
            />
            <div
              className={cn(
                "h-1 flex-1 rounded-full",
                currentStep === "title" ? "bg-primary" : "bg-muted",
              )}
            />
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Template Selection */}
          {currentStep === "template" && (
            <div className="p-4 space-y-2">
              {isPendingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum modelo disponível</p>
                </div>
              ) : (
                templates.map((template) => (
                  <BrandButton
                    key={template.id}
                    variant="ghost"
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full text-left p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-[0.98] h-auto justify-start"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{template.title}</h3>
                        {template.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {template.template_category ?? "Geral"}
                          </span>
                          {(template.usage_count ?? 0) > 10 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </BrandButton>
                ))
              )}
            </div>
          )}

          {/* Step 2: Patient Selection */}
          {currentStep === "patient" && (
            <div className="p-4 space-y-2">
              {isPendingPatients ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : patientOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum paciente cadastrado</p>
                </div>
              ) : (
                patientOptions.map((patient) => (
                  <BrandButton
                    key={patient.id}
                    variant="ghost"
                    onClick={() => handlePatientSelect(patient.id)}
                    className="w-full text-left p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors active:scale-[0.98] h-auto justify-start"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={patient.name} className="h-10 w-10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{patient.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{patient.subtitle}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </BrandButton>
                ))
              )}
            </div>
          )}

          {/* Step 3: Title Input */}
          {currentStep === "title" && (
            <div className="p-4 space-y-6">
              {/* Summary */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Modelo</p>
                  <p className="text-sm font-medium">{selectedTemplate?.title}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Paciente</p>
                  <p className="text-sm font-medium">{selectedPatient?.displayName ?? "—"}</p>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label htmlFor="document-title" className="text-sm font-medium">
                  Título do Documento
                </label>
                <input
                  id="document-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Relatório de Evolução"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              </div>

              {/* Generate Button */}
              <BrandButton
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={!title.trim() || isSubmitting}
                className="w-full h-12 rounded-xl gap-2"
              >
                <Wand2 className="h-4 w-4" />
                {isSubmitting ? "Gerando..." : "Gerar Documento"}
              </BrandButton>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
