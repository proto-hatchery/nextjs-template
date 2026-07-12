import type { CalendarSource } from "@/app/[locale]/(workspace)/(care)/calendar/_feature/ui/event-calendar/types";
import type { CalendarEventType as DbCalendarEventType } from "@workspace/supabase-data/types/entities";

export const CALENDAR_SOURCES = [
  { id: "sessions", label: "Sessões", color: "sky", description: "Sessões clínicas" },
  { id: "supervision", label: "Supervisões", color: "violet", description: "Supervisões" },
  { id: "meetings", label: "Reuniões", color: "orange", description: "Reuniões e compromissos" },
  {
    id: "blocks",
    label: "Bloqueio de Horários",
    color: "amber",
    description: "Horários bloqueados",
  },
  { id: "other", label: "Outros", color: "emerald", description: "Outros eventos" },
  {
    id: "birthdays",
    label: "Aniversários",
    color: "rose",
    description: "Aniversários de pacientes",
  },
  {
    id: "holidays",
    label: "Feriados",
    color: "indigo",
    description: "Feriados nacionais, estaduais e municipais",
  },
] as const satisfies CalendarSource[];

export type CalendarSourceId = (typeof CALENDAR_SOURCES)[number]["id"];
export type CalendarEventType = Exclude<DbCalendarEventType, "task">;

export const CALENDAR_ID_TO_EVENT_TYPE = {
  sessions: "session",
  supervision: "supervision",
  meetings: "meeting",
  blocks: "block",
  other: "other",
  birthdays: "meeting",
  holidays: "other",
} as const satisfies Record<CalendarSourceId, CalendarEventType>;

export const EVENT_TYPE_TO_CALENDAR_ID = {
  session: "sessions",
  supervision: "supervision",
  meeting: "meetings",
  block: "blocks",
  other: "other",
} as const satisfies Record<CalendarEventType, CalendarSourceId>;

export const GOOGLE_CALENDAR_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  google_auth_denied: "Autorização do Google Calendar negada",
  google_not_configured: "Google Calendar não configurado",
  google_invalid_client: "Configuração OAuth inválida (client_id/client_secret)",
  token_exchange_failed: "Falha na autenticação com Google",
  watch_setup_failed: "Conexão criada, mas falhou ao configurar o canal em tempo real.",
  sync_enqueue_failed: "Conexão criada, mas falhou ao iniciar sincronização. Tente novamente.",
  save_failed: "Falha ao salvar conexão",
  state_mismatch: "Erro de segurança na autenticação",
  unexpected_error: "Erro inesperado",
};

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";
