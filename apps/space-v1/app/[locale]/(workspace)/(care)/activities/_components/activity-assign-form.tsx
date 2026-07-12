"use client";

import { useMutation } from "@tanstack/react-query";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2TextArea } from "@workspace/forms/components/base/v2/fluri-field-v2-textarea";
import { FluriPatientFieldV2 } from "@workspace/forms/components/specialized/v2/fluri-patient-field-v2";
import { type Control, Controller, useForm, zodResolver } from "@workspace/forms/react-hook-form";
import { formatBrazilianPhone } from "@workspace/forms/utils/phone";
import { normalizeOptionalStringValue } from "@workspace/forms/v2/kernel";
import {
  getV2InputProps,
  getV2PatientProps,
  getV2SelectProps,
  getV2TextareaProps,
  useV2ControllerField,
} from "@workspace/forms/v2/rhf";
import { createRequiredSelectIdCodec, optionalSelectIdCodec } from "@workspace/forms/v2/schema";
import { assignPatientActivityAction } from "@workspace/supabase-data/actions/patients/assign-patient-activity";
import { usePsychologistPatients } from "@workspace/supabase-data/hooks/patients";
import { usePsychologistTimezone } from "@workspace/supabase-data/hooks/psychologists/use-psychologist-queries";
import { usePatientSessions } from "@workspace/supabase-data/hooks/sessions";
import { isActionError } from "@workspace/supabase-data/lib/boundary/action-error";
import { unwrapActionResultVoid } from "@workspace/supabase-data/lib/boundary/unwrap-action";
import { Badge } from "@workspace/ui/components/badge";
import { nowInTimezone, utcIsoToWallClockDate } from "@workspace/ui/lib/timezone-datetime";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const formatDate = (value: string): string => {
  const chars = value.replace(/\D/g, "").split("");
  const output: string[] = [];

  if (chars.length > 0) {
    if (parseInt(chars[0]!) > 3) return "";
    output.push(chars[0]!);
  }
  if (chars.length > 1) {
    const day = parseInt(chars[0]! + chars[1]!);
    if (day === 0 || day > 31) return output.join("");
    output.push(chars[1]!);
  }

  if (chars.length > 2) {
    if (parseInt(chars[2]!) > 1) return `${output[0]}${output[1]}/`;
    output.push(chars[2]!);
  }
  if (chars.length > 3) {
    const month = parseInt(chars[2]! + chars[3]!);
    if (month === 0 || month > 12) return `${output[0]}${output[1]}/${output[2]}`;
    output.push(chars[3]!);
  }

  if (chars.length > 4) {
    const y1 = parseInt(chars[4]!);
    if (y1 !== 1 && y1 !== 2) return `${output[0]}${output[1]}/${output[2]}${output[3]}/`;
    output.push(chars[4]!);
  }

  for (let i = 5; i < 8 && i < chars.length; i++) {
    output.push(chars[i]!);
  }

  const str = output.join("");
  if (str.length <= 2) return str;
  if (str.length <= 4) return `${str.slice(0, 2)}/${str.slice(2)}`;
  return `${str.slice(0, 2)}/${str.slice(2, 4)}/${str.slice(4)}`;
};

const formatDateToString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const optionalTextCodec = z.codec(z.string(), z.string().optional(), {
  decode: (value) => normalizeOptionalStringValue(value),
  encode: (value) => value ?? "",
});

const createActivitySchema = z.object({
  activityId: z.string().min(1, "Selecione a atividade"),
  patientId: createRequiredSelectIdCodec("Selecione o paciente"),
  sessionId: optionalSelectIdCodec.nullable().optional(),
  dueDate: optionalTextCodec.nullable().optional(),
  instructions: optionalTextCodec.nullable().optional(),
});

type CreateActivityFormValues = z.input<typeof createActivitySchema>;

type CreateActivityInput = z.output<typeof createActivitySchema>;
// Para uso no form, usamos o tipo intermediário que o zodResolver retorna
type CreateActivityFormOutput = z.infer<typeof createActivitySchema>;

interface ActivityAssignFormProps {
  defaultPatientId?: string | undefined;
  defaultActivityId?: string | undefined;
  onCancel?: () => void;
  onSuccess?: () => void;
}

type AssignStep = "patient" | "dueDate" | "session" | "instructions" | "confirm";

const STEP_ORDER: AssignStep[] = ["patient", "dueDate", "session", "instructions", "confirm"];

const STEP_LABELS: Record<AssignStep, string> = {
  patient: "Paciente",
  dueDate: "Prazo",
  session: "Sessão relacionada",
  instructions: "Instruções",
  confirm: "Confirmação",
};

export function ActivityAssignForm({
  defaultPatientId,
  defaultActivityId,
  onCancel,
  onSuccess,
}: ActivityAssignFormProps) {
  const activitySelectRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState<AssignStep>("patient");
  const userTimezone = usePsychologistTimezone();

  const form = useForm<CreateActivityFormValues, unknown, CreateActivityFormOutput>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      activityId: defaultActivityId ?? "",
      patientId: defaultPatientId ?? "",
      sessionId: "",
      dueDate: "",
      instructions: "",
    },
  });

  const { data: patients = [], isPending: isPendingPatients } = usePsychologistPatients();

  const selectedPatientId = form.watch("patientId");
  const {
    data: patientSessions = [],
    isPending: isPendingSessions,
    isFetching: isFetchingSessions,
  } = usePatientSessions(selectedPatientId || undefined);

  const formControl = form.control as Control<CreateActivityFormValues>;
  const dueDateController = useV2ControllerField({
    control: formControl,
    name: "dueDate",
    mode: "string",
  });
  const sessionController = useV2ControllerField({
    control: formControl,
    name: "sessionId",
    mode: "optional-select",
  });
  const instructionsController = useV2ControllerField({
    control: formControl,
    name: "instructions",
    mode: "string",
  });

  const dueDateProps = getV2InputProps(dueDateController.contract);
  const sessionProps = getV2SelectProps(sessionController.contract);
  const instructionsProps = getV2TextareaProps(instructionsController.contract);

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
              const formatted: string = formatBrazilianPhone(brazilianDigits);
              formattedPhone = formatted;
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

  useEffect(() => {
    form.reset({
      activityId: defaultActivityId ?? "",
      patientId: defaultPatientId ?? "",
      sessionId: "",
      dueDate: "",
      instructions: "",
    });
    setStep("patient");
    setTimeout(() => {
      activitySelectRef.current?.focus();
    }, 100);
  }, [defaultActivityId, defaultPatientId, form]);

  useEffect(() => {
    form.setValue("sessionId", "");
  }, [selectedPatientId, form]);

  const submitMutation = useMutation({
    mutationFn: async (data: CreateActivityInput) => {
      const selectedSession = patientSessions.find((session) => session.id === data.sessionId);
      const sessionNote = selectedSession
        ? `Sessão relacionada: ${new Date(
            selectedSession.start_time ?? new Date(),
          ).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : undefined;

      const instructions =
        [data.instructions?.trim(), sessionNote].filter(Boolean).join("\n\n") || undefined;

      const serialized = await assignPatientActivityAction({
        patientId: data.patientId,
        activityId: data.activityId,
        dueDate: data.dueDate ?? undefined,
        instructions,
      });

      try {
        unwrapActionResultVoid(serialized);
      } catch (error) {
        if (isActionError(error)) {
          throw new Error(error.message);
        }
        throw error;
      }

      return data.activityId;
    },
    onSuccess: () => {
      toast.success("Atividade enviada");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao atribuir atividade.");
    },
  });

  const patientPlaceholder = isPendingPatients
    ? "Carregando pacientes..."
    : patientOptions.length > 0
      ? "Selecione o paciente"
      : "Nenhum paciente cadastrado";

  const sessionsPlaceholder = isPendingSessions
    ? "Carregando sessões..."
    : isFetchingSessions
      ? "Atualizando sessões..."
      : patientSessions.length > 0
        ? "Relacionar a uma sessão (opcional)"
        : selectedPatientId
          ? "Nenhuma sessão encontrada"
          : "Selecione um paciente";

  const stepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length;

  const goNext = () => {
    if (step === "patient") {
      const patientId = form.getValues("patientId");
      if (!patientId) {
        form.setError("patientId", { message: "Selecione o paciente" });
        return;
      }
      form.clearErrors("patientId");
    }
    const nextStep = STEP_ORDER[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const goBack = () => {
    const prevStep = STEP_ORDER[stepIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  return (
    <form
      onSubmit={(event) => {
        void form.handleSubmit((data) => submitMutation.mutate(createActivitySchema.parse(data)))(
          event,
        );
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <Badge variant="secondary" className="h-7 rounded-full px-3 text-xs font-medium">
            Etapa {stepIndex + 1} de {totalSteps}
          </Badge>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{STEP_LABELS[step]}</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "patient" && (
          <motion.div
            key="patient"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-foreground">Quem vai receber?</h4>
              <p className="text-sm text-muted-foreground">
                Escolha o paciente para receber a atividade.
              </p>
            </div>
            <div className="flex-1">
              <Controller
                control={formControl}
                name="patientId"
                render={({ field, fieldState }) => (
                  <FluriPatientFieldV2
                    label="Paciente *"
                    placeholder={patientPlaceholder}
                    options={patientOptions}
                    field={getV2PatientProps({
                      value: field.value,
                      onValueChange: field.onChange,
                      onBlur: field.onBlur,
                      name: field.name,
                      ref: field.ref,
                      error: fieldState.error,
                    })}
                    disabled={Boolean(defaultPatientId)}
                    fullWidth
                  />
                )}
              />
            </div>
          </motion.div>
        )}

        {step === "dueDate" && (
          <motion.div
            key="dueDate"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-foreground">Qual é o prazo?</h4>
              <p className="text-sm text-muted-foreground">
                Defina uma data final para acompanhamento (opcional).
              </p>
            </div>
            <div className="flex flex-1 items-start gap-2">
              <FluriFieldV2Input
                label="Prazo"
                field={dueDateProps}
                fullWidth
                placeholder={formatDateToString(nowInTimezone(userTimezone))}
                onValueChange={(value) => dueDateProps.onValueChange(formatDate(value))}
                errorMessage={
                  typeof dueDateProps.errorMessage === "string"
                    ? dueDateProps.errorMessage
                    : undefined
                }
              />
              <div className="flex items-center gap-1">
                {[1, 3, 7].map((days) => (
                  <BrandButton
                    key={days}
                    type="button"
                    variant="secondary"
                    size="small"
                    className="h-10 px-3"
                    onClick={() => {
                      const date = nowInTimezone(userTimezone);
                      date.setDate(date.getDate() + days);
                      form.setValue("dueDate", formatDateToString(date), {
                        shouldValidate: true,
                      });
                    }}
                  >
                    {days}D
                  </BrandButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === "session" && (
          <motion.div
            key="session"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-foreground">Associar a uma sessão?</h4>
              <p className="text-sm text-muted-foreground">
                Você pode vincular a atividade a uma sessão já realizada (opcional).
              </p>
            </div>
            <div className="flex-1">
              <FluriFieldV2Select
                label="Sessão relacionada"
                field={sessionProps}
                fullWidth
                placeholder={sessionsPlaceholder}
                helperText="Você pode pular esta etapa se preferir."
                disabled={!selectedPatientId || patientSessions.length === 0}
                options={patientSessions
                  .filter(
                    (session): session is typeof session & { id: string; start_time: string } =>
                      !!session.id && !!session.start_time,
                  )
                  .map((session) => ({
                    value: session.id,
                    label: utcIsoToWallClockDate(
                      session.start_time,
                      userTimezone,
                    ).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  }))}
              />
            </div>
          </motion.div>
        )}

        {step === "instructions" && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-foreground">Quer adicionar notas?</h4>
              <p className="text-sm text-muted-foreground">
                Inclua detalhes e combinados para evitar dúvidas depois.
              </p>
            </div>
            <div className="flex-1">
              <FluriFieldV2TextArea
                label="Notas adicionais"
                field={instructionsProps}
                fullWidth
                rows={4}
                placeholder="Envie lembretes, materiais ou acordos combinados."
                errorMessage={
                  typeof instructionsProps.errorMessage === "string"
                    ? instructionsProps.errorMessage
                    : undefined
                }
              />
            </div>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-foreground">Confirmar envio</h4>
              <p className="text-sm text-muted-foreground">
                Revise as informações e confirme o envio da atividade.
              </p>
            </div>
            <div className="flex-1 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
              <div className="flex flex-col gap-2">
                <span>
                  Paciente: {patientOptions.find((p) => p.id === selectedPatientId)?.name ?? "—"}
                </span>
                <span>Prazo: {form.watch("dueDate") ?? "Sem prazo"}</span>
                <span>Sessão: {form.watch("sessionId") ? "Relacionada" : "Sem sessão"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        {step !== "patient" ? (
          <BrandButton type="button" variant="ghost" onClick={goBack} className="rounded-full">
            Voltar
          </BrandButton>
        ) : (
          <BrandButton type="button" variant="ghost" onClick={onCancel} className="rounded-full">
            Cancelar
          </BrandButton>
        )}
        {step !== "confirm" ? (
          <BrandButton
            type="button"
            className="min-w-[140px] rounded-full"
            onClick={() => {
              void goNext();
            }}
          >
            Próximo
          </BrandButton>
        ) : (
          <BrandButton
            type="submit"
            className="min-w-[180px] rounded-full"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atribuindo...
              </>
            ) : (
              "Confirmar e enviar"
            )}
          </BrandButton>
        )}
      </div>
    </form>
  );
}
