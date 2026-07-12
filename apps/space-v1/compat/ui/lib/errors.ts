/**
 * Shape compatible with AppError from @workspace/supabase/lib/errors.
 * Defined locally to avoid circular dependency between @workspace/ui and @workspace/supabase.
 */
type ErrorLike = { type?: string; code?: string; message?: string };

/**
 * Standard interface for validation issues (Zod-like).
 */
export interface ValidationIssue {
  code: string;
  message: string;
  path: (string | number)[];
  [key: string]: unknown;
}

/**
 * Generic fallback message for unexpected/infra errors.
 * Use whenever the error type is unknown or Infra — NEVER show technical details to users.
 */
export const GENERIC_ERROR_MESSAGE_USER = "Algo deu errado. Tente novamente.";

/**
 * Friendly messages indexed by AppError.type (discriminated union tag).
 * Infra errors always get the generic message — never expose internal details.
 */
const ERROR_MESSAGES_BY_TYPE: Record<string, string> = {
  Validation: "Verifique as informações e tente novamente.",
  Auth: "Sessão expirada. Faça login novamente.",
  NotFound: "Registro não encontrado.",
  Conflict: "Esta operação não pode ser realizada no momento.",
  Infra: GENERIC_ERROR_MESSAGE_USER,
};

/**
 * Returns a safe, user-facing message for an error.
 * Handles both AppError shapes and arrays of validation issues.
 *
 * @param error - Any AppError or array of validation issues
 */
export function getUserFacingMessage(error: ErrorLike | ValidationIssue[] | unknown): string {
  if (!error) return GENERIC_ERROR_MESSAGE_USER;

  // Handle array of validation issues (ZodError style)
  if (Array.isArray(error)) {
    // Empty array should return generic message
    if (error.length === 0) return GENERIC_ERROR_MESSAGE_USER;
    const firstIssue = error[0] as ValidationIssue;
    return firstIssue?.message || "Erro de validação.";
  }

  const err = error as ErrorLike;

  if (err.type && ERROR_MESSAGES_BY_TYPE[err.type]) {
    return ERROR_MESSAGES_BY_TYPE[err.type] as string;
  }

  // Fallback to error.message if it exists and looks like a user-friendly string
  // but only if it's not a technical error
  if (err.message && !err.message.includes("Error") && !err.message.includes("Exception")) {
    return err.message;
  }

  return GENERIC_ERROR_MESSAGE_USER;
}

/**
 * Returns a safe auth-context message for login/register/password-reset flows.
 * Gives slightly more specific feedback for Auth-type errors.
 */
export function getAuthFacingMessage(error: ErrorLike | ValidationIssue[] | unknown): string {
  if (!error) return GENERIC_ERROR_MESSAGE_USER;

  if (Array.isArray(error)) {
    // Empty array should return generic message
    if (error.length === 0) return GENERIC_ERROR_MESSAGE_USER;
    return (error[0] as ValidationIssue)?.message || "Verifique os dados informados.";
  }

  const err = error as ErrorLike;

  switch (err.type) {
    case "Auth":
      return "Credenciais inválidas. Verifique seu email e senha.";
    case "Validation":
      return err.message || "Verifique os dados informados.";
    case "Conflict":
      return "Este email já está em uso.";
    default:
      return GENERIC_ERROR_MESSAGE_USER;
  }
}
