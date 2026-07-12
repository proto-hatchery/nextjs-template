import type { EventCreationFormValues } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/event-creation-modal";

export function combineDateAndTime(date: Date, time: string): Date | null {
  if (!time || time.length < 5) return null;
  const [hoursStr, minutesStr] = time.split(":");
  const hours = hoursStr ? Number(hoursStr) : 0;
  const minutes = minutesStr ? Number(minutesStr) : 0;

  if (isNaN(hours) || isNaN(minutes)) return null;

  // Construct YYYY-MM-DDTHH:mm:00 manually to avoid timezone issues when parsing
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  const isoString = `${year}-${month}-${day}T${hh}:${mm}:00`;
  const combined = new Date(isoString);

  return isValidDate(combined) ? combined : null;
}

function parseTimeToMinutes(time: string): number {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = hoursStr ? Number(hoursStr) : Number.NaN;
  const minutes = minutesStr ? Number(minutesStr) : Number.NaN;
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN;
  }
  return hours * 60 + minutes;
}

function isValidDate(value: Date): boolean {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function validateEventData(data: EventCreationFormValues): void {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Título é obrigatório");
  }

  if (!data.date || !isValidDate(data.date)) {
    throw new Error("Data inválida");
  }

  if (!data.startTime || !data.endTime) {
    throw new Error("Horário inválido");
  }

  const startTime = parseTimeToMinutes(data.startTime);
  const endTime = parseTimeToMinutes(data.endTime);
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    throw new Error("Horário inválido");
  }

  if (!data.allDay && startTime >= endTime) {
    throw new Error("Horário de término deve ser após horário de início");
  }

  if (data.eventType === "session" && !data.patientId) {
    throw new Error("Paciente é obrigatório");
  }

  if (data.eventType === "supervision" && !data.supervisionType) {
    throw new Error("Tipo de supervisão é obrigatório");
  }
}

export function getCreateEventErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    const normalized = message.toLowerCase();

    if (message.length > 0) {
      if (
        normalized.includes("expandir série") ||
        normalized.includes("expand series") ||
        normalized.includes("invalid rrule") ||
        normalized.includes("rrule format")
      ) {
        if (normalized.includes("invalid rrule") || normalized.includes("rrule format")) {
          return "Formato de recorrência inválido. Verifique a configuração da série.";
        }
        return message;
      }

      if (
        normalized.includes("obrigatório") ||
        normalized.includes("inválida") ||
        normalized.includes("horário") ||
        normalized.includes("falha ao")
      ) {
        return message;
      }
    }

    if (
      normalized.includes("permission") ||
      normalized.includes("rls") ||
      normalized.includes("permiss")
    ) {
      return "Você não tem permissão para criar este evento";
    }

    if (normalized.includes("foreign key")) {
      return "Dados inválidos. Verifique paciente, serviço ou local.";
    }

    if (normalized.includes("violates")) {
      return "Dados inválidos. Verifique os campos obrigatórios.";
    }
  }

  return "Erro ao criar evento. Tente novamente.";
}
