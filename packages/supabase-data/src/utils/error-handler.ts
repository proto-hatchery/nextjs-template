import type { PostgrestError } from "@supabase/supabase-js";

export interface ActionResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export function userFacingDatabaseErrorMessage(message: string, code?: string): string {
  const lower = message.toLowerCase();
  if (
    code === "23P01" ||
    lower.includes("no_overlapping_busy_slots") ||
    lower.includes("exclusion constraint") ||
    (lower.includes("exclusion") && lower.includes("busy_slots"))
  ) {
    return "Este horario ja esta ocupado por outra sessao, bloqueio ou compromisso. Escolha outro horario ou remova o conflito no calendario.";
  }

  return message;
}

export function handleSupabaseError(error: PostgrestError): string {
  switch (error.code) {
    case "23505":
      return "Este registro ja existe. Verifique os dados.";
    case "23503":
      return "Acao bloqueada por dependencias existentes.";
    case "23502":
      return "Campos obrigatorios nao foram preenchidos.";
    case "42501":
      return "Voce nao tem permissao para realizar esta acao.";
    case "PGRST116":
      return "Registro nao encontrado.";
    case "23P01":
      return userFacingDatabaseErrorMessage(error.message, error.code);
    default: {
      const details = error.details ? ` (${error.details})` : "";
      const hint = error.hint ? ` Dica: ${error.hint}` : "";
      return userFacingDatabaseErrorMessage(`Erro: ${error.message}${details}${hint}`, error.code);
    }
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<ActionResponse<T>>,
): Promise<ActionResponse<T>> {
  try {
    return await operation();
  } catch {
    return {
      success: false,
      data: null,
      error: "Ocorreu um erro inesperado. Tente novamente.",
    };
  }
}

export function successResponse<T>(data: T): ActionResponse<T> {
  return { success: true, data, error: null };
}

export function errorResponse<T = never>(error: string): ActionResponse<T> {
  return { success: false, data: null, error };
}
