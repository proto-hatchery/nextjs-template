"use client";

import { useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Clock, Video, X, Check } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  FluriDialogV2,
  FluriDialogV2Content,
  FluriDialogV2Footer,
} from "@workspace/brand/overlays/fluri-dialog-v2";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Field, FieldError } from "@workspace/ui/components/field";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Calendar } from "@workspace/ui/components/calendar";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { FluriFieldV2Select } from "@workspace/forms/components/base/v2/fluri-field-v2-select";
import { FluriFieldV2Input } from "@workspace/forms/components/base/v2/fluri-field-v2-input";
import { FluriFieldV2TextArea } from "@workspace/forms/components/base/v2/fluri-field-v2-textarea";
import {
  FluriFieldV2Currency,
  FluriFieldV2DateSegmentedWithPicker,
  FluriFieldV2TimeSegmented,
} from "@workspace/forms/components/specialized/v2/fluri-fields-v2";
import { FluriPatientFieldV2 } from "@workspace/forms/components/specialized/v2/fluri-patient-field-v2";
import {
  getV2InputProps,
  getV2PatientProps,
  getV2SelectProps,
  getV2TextareaProps,
} from "@workspace/forms/v2/rhf";
import { formatCurrencyInput } from "@workspace/forms/utils/formatting";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { getRoundedNowInTimezone, normalizeTimezone } from "@workspace/ui/lib/timezone-datetime";
import { cn } from "@workspace/ui/lib/utils";

type EventType = "session" | "supervision" | "meeting" | "block" | "other";

const DEFAULT_SESSION_DURATION_MINUTES = 50;
const DEFAULT_OTHER_DURATION_MINUTES = 60;

export type PatientOption = {
  id: string;
  name: string;
  preferredName?: string | null;
};

export type LocationOption = {
  id: string;
  name: string;
};

export type ServiceOption = {
  id: string;
  name: string;
  price?: number | null;
  durationMinutes?: number | null;
};

const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours = 0, minutes = 0] = startTime.split(":").map(Number);
  const totalStartMinutes = hours * 60 + minutes;
  const totalEndMinutes = totalStartMinutes + durationMinutes;
  const normalizedMinutes = ((totalEndMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const endHours = Math.floor(normalizedMinutes / 60);
  const endMinutes = normalizedMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number);
  const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return Math.max(0, endTotal - startTotal);
};

const getRecurrenceLabel = (rule?: string): string => {
  if (!rule) return "Não se repete";

  const normalized = rule.toUpperCase();
  if (normalized.includes("BYDAY=MO,TU,WE,TH,FR")) return "Dias úteis";
  if (normalized.includes("FREQ=DAILY")) return "Diariamente";
  if (normalized.includes("FREQ=WEEKLY")) return "Semanalmente";
  if (normalized.includes("FREQ=MONTHLY")) return "Mensalmente";
  if (normalized.includes("FREQ=YEARLY")) return "Anualmente";

  return "Personalizado";
};

/** Helpers for segmented fields conversion */
const dateToDDMMYYYY = (date: Date | null): string => {
  if (!date || !isValid(date)) return "";
  return format(date, "ddMMyyyy");
};

const ddmmyyyyToDate = (digits: string): Date | null => {
  if (digits.length !== 8) return null;
  const d = parseInt(digits.slice(0, 2), 10);
  const m = parseInt(digits.slice(2, 4), 10);
  const y = parseInt(digits.slice(4, 8), 10);
  if (d && m && y && y > 1900) {
    const newDate = new Date(y, m - 1, d);
    if (!isValid(newDate)) return null;
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
  return null;
};

const timeToHHMM = (time: string): string => {
  return time.replace(/\D/g, "");
};

const hhmmToTime = (digits: string): string => {
  if (digits.length < 4) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

const optionalNumber = z.number().optional();

const eventCreationSchema = z
  .object({
    eventType: z.enum(["session", "supervision", "meeting", "block", "other"]),
    title: z.string().min(1, "O título é obrigatório"),
    date: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    allDay: z.boolean().optional(),
    durationMinutes: z.number().min(15),
    patientId: z.string().optional(),
    serviceId: z.string().optional(),
    locationId: z.string().optional(),
    price: optionalNumber.optional(),
    notes: z.string().optional(),
    supervisionType: z.enum(["giving", "receiving"]).optional(),
    supervisorName: z.string().optional(),
    superviseeName: z.string().optional(),
    topic: z.string().optional(),
    createGoogleMeet: z.boolean().optional(),
    recurrenceRule: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.allDay && calculateDurationMinutes(data.startTime, data.endTime) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Horário de término deve ser após horário de início",
        path: ["endTime"],
      });
    }

    if (data.eventType === "session" && !data.patientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paciente é obrigatório para sessões",
        path: ["patientId"],
      });
    }

    if (data.eventType === "supervision" && !data.supervisionType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tipo de supervisão é obrigatório",
        path: ["supervisionType"],
      });
    }
  });

type EventCreationFormInput = z.input<typeof eventCreationSchema>;

export type EventCreationFormValues = Omit<
  EventCreationFormInput,
  | "allDay"
  | "createGoogleMeet"
  | "patientId"
  | "serviceId"
  | "locationId"
  | "notes"
  | "supervisorName"
  | "superviseeName"
  | "topic"
  | "recurrenceRule"
  | "category"
> & {
  allDay: boolean;
  createGoogleMeet: boolean;
  patientId?: string;
  serviceId?: string;
  locationId?: string;
  notes?: string;
  supervisorName?: string;
  superviseeName?: string;
  topic?: string;
  recurrenceRule?: string;
  category?: string;
};

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventCreationFormValues) => void | Promise<void>;
  timezone?: string;
  patients?: PatientOption[];
  locations?: LocationOption[];
  services?: ServiceOption[];
  isLoadingPatients?: boolean;
  isLoadingLocations?: boolean;
  isLoadingServices?: boolean;
  hasGoogleMeetAccess?: boolean;
  initialValues?: Partial<EventCreationFormInput>;
  lockEventType?: boolean;
  header?: {
    show?: boolean;
    title?: string;
    showClose?: boolean;
    showBack?: boolean;
    onBack?: () => void;
  };
}

export function EventCreationModal({
  isOpen,
  onClose,
  onSubmit,
  timezone,
  patients = [],
  locations = [],
  services = [],
  isLoadingPatients = false,
  isLoadingLocations = false,
  isLoadingServices = false,
  hasGoogleMeetAccess = false,
  initialValues,
  lockEventType = false,
  header,
}: EventCreationModalProps) {
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState<EventType>("session");
  const [currentStep, setCurrentStep] = useState(1);
  const [isDateTimeExpanded, setIsDateTimeExpanded] = useState(false);
  const [isGoogleMeetAdded, setIsGoogleMeetAdded] = useState(false);

  const resolvedTimezone = useMemo(() => normalizeTimezone(timezone), [timezone]);
  const defaultDateTime = useMemo(
    () => getRoundedNowInTimezone(resolvedTimezone, { roundToMinutes: 60 }),
    [resolvedTimezone],
  );
  const defaultDate = useMemo(
    () =>
      new Date(
        defaultDateTime.getFullYear(),
        defaultDateTime.getMonth(),
        defaultDateTime.getDate(),
        0,
        0,
        0,
        0,
      ),
    [defaultDateTime],
  );
  const defaultStartTime = useMemo(() => format(defaultDateTime, "HH:mm"), [defaultDateTime]);

  const form = useForm<EventCreationFormInput>({
    resolver: zodResolver(eventCreationSchema),
    defaultValues: {
      eventType: "session",
      title: "",
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: calculateEndTime(defaultStartTime, DEFAULT_SESSION_DURATION_MINUTES),
      allDay: false,
      durationMinutes: DEFAULT_SESSION_DURATION_MINUTES,
      patientId: "",
      serviceId: "",
      locationId: "",
      price: undefined,
      notes: "",
      supervisionType: undefined,
      supervisorName: "",
      superviseeName: "",
      topic: "",
      createGoogleMeet: false,
      recurrenceRule: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    clearErrors,
    trigger,
  } = form;

  const startTime = watch("startTime");
  const currentDuration = watch("durationMinutes");
  const date = watch("date");
  const endTime = watch("endTime");
  const allDay = watch("allDay");
  const recurrenceRule = watch("recurrenceRule");
  const selectedPatientId = watch("patientId");
  const selectedServiceId = watch("serviceId");
  const currentPrice = watch("price");
  const supervisionType = watch("supervisionType");

  const selectedService = services.find((service) => service.id === selectedServiceId);
  const recurrenceLabel = useMemo(() => getRecurrenceLabel(recurrenceRule), [recurrenceRule]);
  const canProceedFromStepOne = useMemo(() => {
    if (selectedTab === "session") {
      return typeof selectedPatientId === "string" && selectedPatientId.trim().length > 0;
    }

    if (selectedTab === "supervision") {
      return typeof supervisionType === "string" && supervisionType.length > 0;
    }

    return true;
  }, [selectedPatientId, selectedTab, supervisionType]);

  useEffect(() => {
    if (isOpen) {
      reset({
        eventType: "session",
        title: "",
        date: defaultDate,
        startTime: defaultStartTime,
        endTime: calculateEndTime(defaultStartTime, DEFAULT_SESSION_DURATION_MINUTES),
        allDay: false,
        durationMinutes: DEFAULT_SESSION_DURATION_MINUTES,
        notes: "",
        createGoogleMeet: false,
        ...initialValues,
      });
      setCurrentStep(1);
      if (initialValues?.eventType) {
        setSelectedTab(initialValues.eventType);
      }
    }
  }, [isOpen, initialValues, reset, defaultDate, defaultStartTime]);

  useEffect(() => {
    // Atualiza o eventType sem validar - a validação acontece apenas no submit
    setValue("eventType", selectedTab, { shouldValidate: false });
    // Limpa erros específicos do tipo anterior ao mudar de tab
    clearErrors(["patientId", "supervisionType"]);
    setCurrentStep(1);
  }, [selectedTab, setValue, clearErrors]);

  useEffect(() => {
    if (selectedTab !== "session") {
      return;
    }

    if (selectedService?.durationMinutes) {
      return;
    }

    const defaultEndTime = calculateEndTime(startTime, DEFAULT_OTHER_DURATION_MINUTES);
    const shouldApplyDefault =
      currentDuration === DEFAULT_OTHER_DURATION_MINUTES && endTime === defaultEndTime;

    if (shouldApplyDefault) {
      setValue("durationMinutes", DEFAULT_SESSION_DURATION_MINUTES);
      setValue("endTime", calculateEndTime(startTime, DEFAULT_SESSION_DURATION_MINUTES));
    }
  }, [currentDuration, endTime, selectedService, selectedTab, setValue, startTime]);

  useEffect(() => {
    if (!allDay) return;
    setValue("startTime", "00:00");
    setValue("endTime", "23:59");
    setValue("durationMinutes", 24 * 60 - 1);
  }, [allDay, setValue]);

  useEffect(() => {
    if (!selectedService) return;

    const hasPrice = currentPrice !== undefined && !Number.isNaN(currentPrice);
    if (!hasPrice && selectedService.price !== undefined && selectedService.price !== null) {
      setValue("price", selectedService.price);
    }

    if (selectedService.durationMinutes !== null && selectedService.durationMinutes !== undefined) {
      setValue("durationMinutes", selectedService.durationMinutes);
      setValue("endTime", calculateEndTime(startTime, selectedService.durationMinutes));
    }
  }, [currentPrice, selectedService, setValue, startTime]);

  const getDateTimeSummary = () => {
    const dateStr = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
    const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    if (allDay) {
      return `${capitalizedDate} · Dia inteiro`;
    }

    return `${capitalizedDate}    ${startTime} - ${endTime}`;
  };

  const handleStartTimeChange = (newStartTime: string) => {
    if (allDay) return;
    setValue("startTime", newStartTime);
    if (newStartTime.length === 5) {
      setValue("endTime", calculateEndTime(newStartTime, currentDuration));
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    if (allDay) return;
    setValue("endTime", newEndTime);
    if (newEndTime.length === 5 && startTime.length === 5) {
      const nextDuration = calculateDurationMinutes(startTime, newEndTime);
      if (nextDuration > 0) {
        setValue("durationMinutes", nextDuration);
      }
    }
  };

  const handleClose = () => {
    reset({
      eventType: "session",
      title: "",
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: calculateEndTime(defaultStartTime, DEFAULT_SESSION_DURATION_MINUTES),
      allDay: false,
      durationMinutes: DEFAULT_SESSION_DURATION_MINUTES,
      patientId: "",
      serviceId: "",
      locationId: "",
      price: undefined,
      notes: "",
      supervisionType: undefined,
      supervisorName: "",
      superviseeName: "",
      topic: "",
      createGoogleMeet: false,
      recurrenceRule: "",
    });
    setSelectedTab("session");
    setCurrentStep(1);
    setIsDateTimeExpanded(false);
    setIsGoogleMeetAdded(false);
    onClose();
  };

  const handleFormSubmit = async (data: EventCreationFormInput) => {
    // Destructure to exclude optional fields that might be undefined
    const {
      price,
      supervisionType,
      patientId,
      serviceId,
      locationId,
      supervisorName,
      superviseeName,
      topic,
      notes,
      recurrenceRule,
      allDay,
      createGoogleMeet,
      ...rest
    } = data;

    const normalizedData: EventCreationFormValues = {
      ...rest,
      allDay: allDay ?? false,
      createGoogleMeet: isGoogleMeetAdded,
      ...(price !== undefined ? { price } : {}),
      ...(supervisionType !== undefined ? { supervisionType } : {}),
      ...(patientId ? { patientId } : {}),
      ...(serviceId ? { serviceId } : {}),
      ...(locationId ? { locationId } : {}),
      ...(supervisorName ? { supervisorName } : {}),
      ...(superviseeName ? { superviseeName } : {}),
      ...(topic ? { topic } : {}),
      ...(notes ? { notes } : {}),
      ...(recurrenceRule ? { recurrenceRule } : {}),
    };

    await onSubmit(normalizedData);
    reset({
      eventType: "session",
      title: "",
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: calculateEndTime(defaultStartTime, DEFAULT_SESSION_DURATION_MINUTES),
      allDay: false,
      durationMinutes: DEFAULT_SESSION_DURATION_MINUTES,
      patientId: "",
      serviceId: "",
      locationId: "",
      price: undefined,
      notes: "",
      supervisionType: undefined,
      supervisorName: "",
      superviseeName: "",
      topic: "",
      createGoogleMeet: false,
      recurrenceRule: "",
    });
    setSelectedTab("session");
    setCurrentStep(1);
    setIsDateTimeExpanded(false);
    setIsGoogleMeetAdded(false);
    onClose();
  };

  const isMultiStep = selectedTab === "session" || selectedTab === "supervision";

  const formContent = (
    <div className="flex flex-col w-full max-w-[460px] mx-auto px-6">
      {isMultiStep && currentStep === 2 && (
        <div className="py-2 px-1 mb-2">
          <div className="text-sm font-semibold text-foreground truncate">
            {watch("title") || "Sem título"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })} · {startTime}
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <>
          <div className="pt-2 pb-4 px-1">
            <Field data-invalid={!!errors.title}>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <input
                    {...field}
                    autoFocus
                    id="title"
                    placeholder="Adicionar título"
                    aria-invalid={!!errors.title}
                    className="w-full px-0 pb-2 bg-transparent border-b border-gray-200 focus:border-[#1A1A1A] outline-none transition-all text-lg font-normal placeholder-gray-500"
                    autoComplete="off"
                  />
                )}
              />
              {errors.title && <FieldError errors={[errors.title]} />}
            </Field>
          </div>

          <div className="px-1 overflow-x-auto scrollbar-hide -mx-6 px-6">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => {
                if (lockEventType) return;
                const nextTab = value as EventType;
                setSelectedTab(nextTab);
                // O useEffect acima vai sincronizar o eventType e limpar erros
              }}
            >
              <TabsList className="h-auto inline-flex w-fit justify-start gap-2 rounded-none border-0 bg-transparent p-0">
                <TabsTrigger
                  value="session"
                  disabled={lockEventType}
                  className={cn(
                    "relative rounded-full bg-transparent px-3 py-1.5 text-sm font-normal text-muted-foreground transition-all",
                    "hover:text-foreground hover:bg-accent/50",
                    "data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    lockEventType && "cursor-not-allowed opacity-60",
                  )}
                >
                  Sessão
                </TabsTrigger>
                <TabsTrigger
                  value="supervision"
                  disabled={lockEventType}
                  className={cn(
                    "relative rounded-full bg-transparent px-3 py-1.5 text-sm font-normal text-muted-foreground transition-all",
                    "hover:text-foreground hover:bg-accent/50",
                    "data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    lockEventType && "cursor-not-allowed opacity-60",
                  )}
                >
                  Supervisão
                </TabsTrigger>
                <TabsTrigger
                  value="meeting"
                  disabled={lockEventType}
                  className={cn(
                    "relative rounded-full bg-transparent px-3 py-1.5 text-sm font-normal text-muted-foreground transition-all",
                    "hover:text-foreground hover:bg-accent/50",
                    "data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    lockEventType && "cursor-not-allowed opacity-60",
                  )}
                >
                  Reunião
                </TabsTrigger>
                <TabsTrigger
                  value="block"
                  disabled={lockEventType}
                  className={cn(
                    "relative rounded-full bg-transparent px-3 py-1.5 text-sm font-normal text-muted-foreground transition-all",
                    "hover:text-foreground hover:bg-accent/50",
                    "data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    lockEventType && "cursor-not-allowed opacity-60",
                  )}
                >
                  Bloqueio
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  disabled={lockEventType}
                  className={cn(
                    "relative rounded-full bg-transparent px-3 py-1.5 text-sm font-normal text-muted-foreground transition-all",
                    "hover:text-foreground hover:bg-accent/50",
                    "data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    lockEventType && "cursor-not-allowed opacity-60",
                  )}
                >
                  Outros
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </>
      )}

      <ScrollArea className="max-h-[calc(100vh-280px)] -mx-6 px-6 overflow-visible">
        <form
          id="event-creation-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (isMultiStep && currentStep === 1) {
              e.preventDefault();
              const fieldsToValidate =
                selectedTab === "session"
                  ? (["title", "patientId", "date", "startTime", "endTime"] as const)
                  : (["title", "supervisionType", "date", "startTime", "endTime"] as const);

              void trigger(fieldsToValidate, { shouldFocus: true }).then((isValid) => {
                if (isValid) {
                  setCurrentStep(2);
                }
              });
              return;
            }
            // For step 2, use handleSubmit which will catch validation errors internally
            // The zodResolver should handle errors gracefully but superRefine may throw
            handleSubmit(
              handleFormSubmit,
              // onInvalid callback - called when validation fails
              () => {
                // Errors are already set in formState by zodResolver
              },
            )(e).catch((error) => {
              // Catch any unexpected errors (like ZodError from superRefine)
              if (
                error &&
                typeof error === "object" &&
                "errors" in error &&
                Array.isArray(error.errors)
              ) {
                console.error("Validation error during submit:", error);
              }
            });
          }}
          className="py-4 px-1 space-y-6"
        >
          {currentStep === 1 ? (
            <>
              <div className="space-y-3">
                {!isDateTimeExpanded ? (
                  <button
                    type="button"
                    onClick={() => setIsDateTimeExpanded(true)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/60 transition-colors text-left",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    )}
                  >
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {getDateTimeSummary()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{recurrenceLabel}</div>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-3.5 h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="col-span-2">
                            <Controller
                              control={control}
                              name="date"
                              render={({ field, fieldState }) => (
                                <FluriFieldV2DateSegmentedWithPicker
                                  label="Data"
                                  value={dateToDDMMYYYY(field.value)}
                                  onChange={(e) => {
                                    const newDate = ddmmyyyyToDate(e.target.value);
                                    if (newDate) {
                                      field.onChange(newDate);
                                    }
                                  }}
                                  errorMessage={fieldState.error?.message}
                                  fullWidth
                                />
                              )}
                            />
                          </div>
                          {!allDay && (
                            <>
                              <div className="col-span-1 transition-all duration-200">
                                <Controller
                                  control={control}
                                  name="startTime"
                                  render={({ field, fieldState }) => (
                                    <FluriFieldV2TimeSegmented
                                      label="Início"
                                      value={timeToHHMM(field.value)}
                                      onChange={(e) => {
                                        const newTime = hhmmToTime(e.target.value);
                                        field.onChange(newTime);
                                        handleStartTimeChange(newTime);
                                      }}
                                      onBlur={field.onBlur}
                                      errorMessage={fieldState.error?.message}
                                      fullWidth
                                    />
                                  )}
                                />
                              </div>
                              <div className="col-span-1 transition-all duration-200">
                                <Controller
                                  control={control}
                                  name="endTime"
                                  render={({ field, fieldState }) => (
                                    <FluriFieldV2TimeSegmented
                                      label="Término"
                                      value={timeToHHMM(field.value)}
                                      onChange={(e) => {
                                        const newTime = hhmmToTime(e.target.value);
                                        field.onChange(newTime);
                                        handleEndTimeChange(newTime);
                                      }}
                                      onBlur={field.onBlur}
                                      errorMessage={fieldState.error?.message}
                                      fullWidth
                                    />
                                  )}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm px-1">
                          <Controller
                            control={control}
                            name="allDay"
                            render={({ field }) => (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(field.value)}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-muted-foreground">Dia inteiro</span>
                              </label>
                            )}
                          />
                        </div>

                        <div className="px-1">
                          <Controller
                            control={control}
                            name="recurrenceRule"
                            render={({ field, fieldState }) => (
                              <FluriFieldV2Select
                                label="Recorrência"
                                options={[
                                  { label: "Não se repete", value: "none" },
                                  { label: "Diariamente", value: "FREQ=DAILY" },
                                  {
                                    label: "Dias úteis (seg-sex)",
                                    value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
                                  },
                                  { label: "Semanalmente", value: "FREQ=WEEKLY" },
                                  { label: "Mensalmente", value: "FREQ=MONTHLY" },
                                  { label: "Anualmente", value: "FREQ=YEARLY" },
                                ]}
                                field={getV2SelectProps({
                                  value: field.value || "none",
                                  onValueChange: (val) => field.onChange(val === "none" ? "" : val),
                                  onBlur: field.onBlur,
                                  name: field.name,
                                  ref: field.ref,
                                  error: fieldState.error,
                                })}
                                fullWidth
                                showClearButton={false}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedTab !== "block" && (
                <div className="space-y-2">
                  {!isGoogleMeetAdded ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasGoogleMeetAccess) return;
                        setIsGoogleMeetAdded(true);
                        setValue("createGoogleMeet", true);
                      }}
                      disabled={!hasGoogleMeetAccess}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/60 transition-colors text-left",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        !hasGoogleMeetAccess &&
                          "cursor-not-allowed opacity-60 hover:bg-transparent",
                      )}
                    >
                      <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {hasGoogleMeetAccess
                            ? "Adicionar videoconferência do Google Meet"
                            : "Conecte o Google Calendar para adicionar Meet"}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsGoogleMeetAdded(false);
                        setValue("createGoogleMeet", false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border-l-4 border-primary bg-accent/40 hover:bg-accent/50 transition-colors text-left",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      )}
                    >
                      <div className="relative">
                        <Video className="h-5 w-5 text-primary flex-shrink-0" />
                        <Check className="h-3 w-3 text-primary absolute -bottom-1 -right-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          Videoconferência do Google Meet será adicionada
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          O link do Meet será criado automaticamente ao salvar o evento
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGoogleMeetAdded(false);
                          setValue("createGoogleMeet", false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setIsGoogleMeetAdded(false);
                            setValue("createGoogleMeet", false);
                          }
                        }}
                        className="ml-2 p-1 hover:bg-accent/60 rounded transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  )}
                </div>
              )}

              {selectedTab === "session" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-3.5 h-5 w-5 text-muted-foreground flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name="patientId"
                        render={({ field, fieldState }) => (
                          <FluriPatientFieldV2
                            label="Paciente"
                            placeholder="Adicionar paciente"
                            options={patients.map((p) => ({
                              id: p.id,
                              name: p.preferredName ?? p.name,
                            }))}
                            field={getV2PatientProps({
                              name: field.name,
                              value: field.value,
                              onValueChange: field.onChange,
                              onBlur: field.onBlur,
                              ref: field.ref,
                              error: fieldState.error,
                            })}
                            fullWidth
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "supervision" && (
                <div className="space-y-4">
                  <div className="flex gap-2 p-1">
                    <button
                      type="button"
                      className={cn(
                        "flex-1 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border shadow-sm",
                        supervisionType === "giving"
                          ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
                          : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60",
                      )}
                      onClick={() => setValue("supervisionType", "giving")}
                    >
                      Supervisor
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex-1 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border shadow-sm",
                        supervisionType === "receiving"
                          ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
                          : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60",
                      )}
                      onClick={() => setValue("supervisionType", "receiving")}
                    >
                      Supervisionado
                    </button>
                  </div>
                  {errors.supervisionType && <FieldError errors={[errors.supervisionType]} />}
                </div>
              )}

              {(selectedTab === "meeting" ||
                selectedTab === "block" ||
                selectedTab === "other") && (
                <div className="space-y-4">
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2TextArea
                        label="Observações"
                        placeholder="Observações sobre o evento"
                        field={getV2TextareaProps({
                          name: field.name,
                          value: field.value ?? "",
                          onValueChange: field.onChange,
                          onBlur: field.onBlur,
                          ref: field.ref,
                          error: fieldState.error,
                        })}
                        fullWidth
                      />
                    )}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {selectedTab === "session" && (
                <>
                  <Controller
                    control={control}
                    name="serviceId"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Select
                        label="Serviço"
                        placeholder="Selecione o serviço..."
                        options={services.map((s) => ({ label: s.name, value: s.id }))}
                        field={getV2SelectProps({
                          value: field.value,
                          onValueChange: field.onChange,
                          onBlur: field.onBlur,
                          name: field.name,
                          ref: field.ref,
                          error: fieldState.error,
                        })}
                        fullWidth
                        required
                        helperText={isLoadingServices ? "Carregando serviços..." : undefined}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="locationId"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Select
                        label="Local"
                        placeholder="Online"
                        options={locations.map((l) => ({ label: l.name, value: l.id }))}
                        field={getV2SelectProps({
                          value: field.value,
                          onValueChange: field.onChange,
                          onBlur: field.onBlur,
                          name: field.name,
                          ref: field.ref,
                          error: fieldState.error,
                        })}
                        fullWidth
                        required
                        helperText={isLoadingLocations ? "Carregando locais..." : undefined}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="price"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Currency
                        label="Valor"
                        placeholder="R$ 0,00"
                        value={
                          field.value !== undefined
                            ? formatCurrencyInput(String(Math.round(field.value * 100)))
                            : ""
                        }
                        onChange={(event) => {
                          const digitsOnly = event.target.value.replace(/\D/g, "");
                          field.onChange(digitsOnly ? Number(digitsOnly) / 100 : undefined);
                        }}
                        errorMessage={fieldState.error?.message}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="notes"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2TextArea
                        label="Observações"
                        placeholder="Observações sobre a sessão"
                        field={getV2TextareaProps({
                          name: field.name,
                          value: field.value ?? "",
                          onValueChange: field.onChange,
                          onBlur: field.onBlur,
                          ref: field.ref,
                          error: fieldState.error,
                        })}
                        fullWidth
                      />
                    )}
                  />
                </>
              )}

              {selectedTab === "supervision" && (
                <>
                  <div className="mb-2 px-1">
                    <p className="text-xs text-muted-foreground italic">
                      Todos os campos abaixo são opcionais. Você pode salvar agora se desejar.
                    </p>
                  </div>

                  {supervisionType === "giving" && (
                    <Controller
                      control={control}
                      name="superviseeName"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Nome do supervisionado"
                          placeholder="Nome do supervisionado"
                          field={getV2InputProps({
                            value: field.value ?? "",
                            onValueChange: field.onChange,
                            ...(field.onBlur !== undefined ? { onBlur: field.onBlur } : {}),
                            ...(field.name !== undefined ? { name: field.name } : {}),
                            ...(field.ref !== undefined ? { ref: field.ref } : {}),
                            ...(fieldState.error !== undefined ? { error: fieldState.error } : {}),
                          })}
                          fullWidth
                        />
                      )}
                    />
                  )}

                  {supervisionType === "receiving" && (
                    <Controller
                      control={control}
                      name="supervisorName"
                      render={({ field, fieldState }) => (
                        <FluriFieldV2Input
                          label="Nome do supervisor"
                          placeholder="Nome do supervisor"
                          field={getV2InputProps({
                            value: field.value ?? "",
                            onValueChange: field.onChange,
                            ...(field.onBlur !== undefined ? { onBlur: field.onBlur } : {}),
                            ...(field.name !== undefined ? { name: field.name } : {}),
                            ...(field.ref !== undefined ? { ref: field.ref } : {}),
                            ...(fieldState.error !== undefined ? { error: fieldState.error } : {}),
                          })}
                          fullWidth
                        />
                      )}
                    />
                  )}

                  <Controller
                    control={control}
                    name="topic"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2Input
                        label="Tópico"
                        placeholder="Tema da supervisão"
                        field={getV2InputProps({
                          value: field.value ?? "",
                          onValueChange: field.onChange,
                          ...(field.onBlur !== undefined ? { onBlur: field.onBlur } : {}),
                          ...(field.name !== undefined ? { name: field.name } : {}),
                          ...(field.ref !== undefined ? { ref: field.ref } : {}),
                          ...(fieldState.error !== undefined ? { error: fieldState.error } : {}),
                        })}
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="notes"
                    render={({ field, fieldState }) => (
                      <FluriFieldV2TextArea
                        label="Observações"
                        placeholder="Observações sobre a supervisão"
                        field={getV2TextareaProps({
                          name: field.name,
                          value: field.value ?? "",
                          onValueChange: field.onChange,
                          onBlur: field.onBlur,
                          ref: field.ref,
                          error: fieldState.error,
                        })}
                        fullWidth
                      />
                    )}
                  />
                </>
              )}
            </div>
          )}
        </form>
      </ScrollArea>
    </div>
  );

  const footerContent = (
    <div className="flex items-center gap-2">
      {isMultiStep && currentStep === 2 && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCurrentStep(1)}
          className="rounded-full"
        >
          Voltar
        </Button>
      )}
      <BrandButton
        family="rounded"
        type="submit"
        form="event-creation-form"
        disabled={isSubmitting || (isMultiStep && currentStep === 1 && !canProceedFromStepOne)}
        variant="secondary"
        className="sm:w-auto"
      >
        {isSubmitting ? "Salvando..." : isMultiStep && currentStep === 1 ? "Seguinte" : "Salvar"}
      </BrandButton>
    </div>
  );

  const headerConfig = {
    show: header?.show ?? true,
    title: header?.title ?? "Novo Evento",
    showClose: header?.showClose ?? true,
    showBack: header?.showBack ?? (isMultiStep && currentStep === 2),
    onBack: header?.onBack ?? (() => setCurrentStep(1)),
  };

  const showHeader =
    headerConfig.show && (headerConfig.showClose || headerConfig.showBack || headerConfig.title);

  const headerButtonClasses =
    "p-2.5 rounded-full bg-accent hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer";

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent
          side="bottom"
          className="h-[90vh] sm:max-w-none overflow-y-auto rounded-t-[10px] p-0"
        >
          <VisuallyHidden.Root>
            <SheetTitle>Novo Evento</SheetTitle>
          </VisuallyHidden.Root>
          <ScrollArea className="flex-1">{formContent}</ScrollArea>
          <div className="border-t border-border/40 mt-auto px-4 py-4 flex justify-end">
            {footerContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <FluriDialogV2 open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <FluriDialogV2Content
        className="p-0 flex flex-col rounded-3xl"
        showCloseButton={false}
        title="Novo Evento"
        description="Formulário para criar ou editar um evento do calendário."
        hideTitle
      >
        {showHeader && (
          <div className="grid grid-cols-3 items-center px-4 py-2">
            <div className="flex items-center justify-start">
              {headerConfig.showBack && (
                <button
                  type="button"
                  onClick={headerConfig.onBack}
                  className={cn(headerButtonClasses, "ml-1 mt-2")}
                  aria-label="Voltar"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="text-center">
              {headerConfig.title && (
                <div className="text-base font-semibold text-foreground">{headerConfig.title}</div>
              )}
            </div>
            <div className="flex items-center justify-end">
              {headerConfig.showClose && (
                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(headerButtonClasses, "mr-1 mt-2")}
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        )}

        {formContent}

        <FluriDialogV2Footer className="grid grid-cols-3 items-center px-4 pb-2 pt-1">
          <div />
          <div />
          <div className="flex items-center justify-end">
            <div className="mr-1 mb-2">{footerContent}</div>
          </div>
        </FluriDialogV2Footer>
      </FluriDialogV2Content>
    </FluriDialogV2>
  );
}
