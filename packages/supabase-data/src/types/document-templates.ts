/**
 * Document Templates - Types and Constants
 *
 * Variable substitution system following {{scope.field}} pattern, e.g: {{patient.fullName}}
 */

export type SerializedLexicalState = {
  root: {
    children: unknown[];
    direction: string | null;
    format: string | number;
    indent: number;
    type: string;
    version: number;
  };
};

/**
 * Catálogo de todas as variáveis disponíveis para substituição em templates.
 * Organizado por escopo: patient, psychologist, system.
 */
export const AVAILABLE_VARIABLES = {
  patient: [
    "fullName",
    "displayName",
    "email",
    "phone",
    "cpf",
    "rg",

    "dateOfBirth",
    "age",
    "gender",
    "pronouns",
    "placeOfBirth",
    "profession",

    "isMinor",
    "guardianName",
    "initialComplaint",
    "clinicalHypothesis",
    "treatmentPlan",

    // Dados do relacionamento
    "relationshipStartDate",
    "firstSessionDate",
    "lastSessionDate",
    "totalSessionsCount",
  ] as const,

  psychologist: ["fullName", "displayName", "crp", "crpState", "crpFull", "phone", "cpf"] as const,

  system: [
    "currentDate",
    "currentDateExtended",
    "currentDatetime",
    "currentYear",
    "currentMonth",
    "currentMonthName",
  ] as const,
} as const;

export type PatientVariableKey = (typeof AVAILABLE_VARIABLES.patient)[number];
export type PsychologistVariableKey = (typeof AVAILABLE_VARIABLES.psychologist)[number];
export type SystemVariableKey = (typeof AVAILABLE_VARIABLES.system)[number];

export type VariableScope = "patient" | "psychologist" | "system";
export type VariableKey = PatientVariableKey | PsychologistVariableKey | SystemVariableKey;

export interface VariableMetadata {
  key: string;
  label: string;
  description?: string;
  example?: string;
}

/**
 * Variáveis de paciente que não existem no banco de dados (campos manual/synced)
 * mas são comumente usadas em templates. Serão substituídas por placeholders
 * descritivos para preenchimento manual no editor.
 */
export const MANUAL_ONLY_PATIENT_VARIABLES: Record<string, VariableMetadata> = {
  maritalStatus: { key: "maritalStatus", label: "Estado civil", example: "Solteira" },
  educationLevel: {
    key: "educationLevel",
    label: "Escolaridade",
    example: "Ensino Superior Completo",
  },
  nationality: { key: "nationality", label: "Nacionalidade", example: "Brasileira" },
  address: { key: "address", label: "Endereço", example: "Rua das Flores, 123 - São Paulo, SP" },
  motherName: { key: "motherName", label: "Nome da mãe", example: "Maria da Silva Santos" },
  fatherName: { key: "fatherName", label: "Nome do pai", example: "José da Silva Santos" },
};

export const VARIABLE_METADATA: Record<VariableScope, VariableMetadata[]> = {
  patient: [
    { key: "fullName", label: "Nome completo", example: "Maria da Silva Santos" },
    { key: "displayName", label: "Nome de exibição", example: "Maria" },
    { key: "email", label: "E-mail", example: "maria@email.com" },
    { key: "phone", label: "Telefone", example: "(11) 99999-9999" },
    { key: "cpf", label: "CPF", example: "123.456.789-00" },
    { key: "rg", label: "RG", example: "12.345.678-9" },
    { key: "dateOfBirth", label: "Data de nascimento", example: "15/03/1990" },
    { key: "age", label: "Idade", example: "34" },
    { key: "gender", label: "Gênero", example: "Feminino" },
    { key: "pronouns", label: "Pronomes", example: "ela/dela" },
    { key: "placeOfBirth", label: "Naturalidade", example: "São Paulo, SP" },
    { key: "profession", label: "Profissão", example: "Engenheira" },
    { key: "isMinor", label: "É menor de idade", example: "Não" },
    { key: "guardianName", label: "Nome do responsável", example: "José da Silva" },
    {
      key: "initialComplaint",
      label: "Queixa inicial",
      example: "Ansiedade e dificuldade de sono",
    },
    { key: "clinicalHypothesis", label: "Hipótese clínica", example: "TAG" },
    { key: "treatmentPlan", label: "Plano de tratamento", example: "TCC focada em ansiedade" },
    { key: "relationshipStartDate", label: "Início do acompanhamento", example: "01/01/2024" },
    { key: "firstSessionDate", label: "Data da primeira sessão", example: "05/01/2024" },
    { key: "lastSessionDate", label: "Data da última sessão", example: "15/11/2024" },
    { key: "totalSessionsCount", label: "Total de sessões", example: "24" },
  ],
  psychologist: [
    { key: "fullName", label: "Nome completo", example: "Dr. João da Silva" },
    { key: "displayName", label: "Nome de exibição", example: "João" },
    { key: "crp", label: "Número do CRP", example: "123456" },
    { key: "crpState", label: "Estado do CRP", example: "SP" },
    { key: "crpFull", label: "CRP completo", example: "CRP 06/123456" },
    { key: "phone", label: "Telefone", example: "(11) 98888-8888" },
    { key: "cpf", label: "CPF", example: "987.654.321-00" },
  ],
  system: [
    { key: "currentDate", label: "Data atual", example: "01/12/2024" },
    {
      key: "currentDateExtended",
      label: "Data atual por extenso",
      example: "01 de dezembro de 2024",
    },
    { key: "currentDatetime", label: "Data e hora atual", example: "01/12/2024 14:30" },
    { key: "currentYear", label: "Ano atual", example: "2024" },
    { key: "currentMonth", label: "Mês atual (número)", example: "12" },
    { key: "currentMonthName", label: "Mês atual (nome)", example: "dezembro" },
  ],
};

export interface DocumentTemplateData {
  version: "1.0";
  content: SerializedLexicalState;
  usedVariables?: string[];
  metadata?: {
    category?: "report" | "certificate" | "declaration" | "referral" | "other";
    description?: string;
    tags?: string[];
  };
}

export interface VariableSubstitutionContext {
  patient: Record<PatientVariableKey, string | number | boolean | null>;
  psychologist: Record<PsychologistVariableKey, string | null>;
  system: Record<SystemVariableKey, string>;
}

export interface SubstitutionWarning {
  variable: string;
  message: string;
  replacedWith?: string;
}

export interface SubstitutionError {
  variable: string;
  message: string;
  code: "MISSING_VARIABLE" | "INVALID_FORMAT" | "INVALID_SCOPE";
}

export interface SubstitutionResult {
  substitutedContent: SerializedLexicalState;
  /** Non-critical warnings (e.g., empty variable replaced with [N/A]) */
  warnings: SubstitutionWarning[];
  /** Critical errors (e.g., variable with invalid format) */
  errors: SubstitutionError[];
  success: boolean;
}

// ============================================
// Utility Type Guards
// ============================================

export function isPatientVariable(key: string): key is PatientVariableKey {
  return (AVAILABLE_VARIABLES.patient as readonly string[]).includes(key);
}

export function isPsychologistVariable(key: string): key is PsychologistVariableKey {
  return (AVAILABLE_VARIABLES.psychologist as readonly string[]).includes(key);
}

export function isSystemVariable(key: string): key is SystemVariableKey {
  return (AVAILABLE_VARIABLES.system as readonly string[]).includes(key);
}

export function isValidVariableScope(scope: string): scope is VariableScope {
  return scope === "patient" || scope === "psychologist" || scope === "system";
}
