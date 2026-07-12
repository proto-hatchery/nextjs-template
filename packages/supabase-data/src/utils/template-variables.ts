/**
 * Template Variables Substitution Utilities
 *
 * Funções para substituir variáveis {{scope.field}} em templates Lexical,
 * construir contextos de substituição a partir de dados do paciente/psicólogo,
 * e extrair variáveis usadas em um template.
 */

import type { SerializedEditor } from "@workspace/lexical-editor/types";
import {
  type DocumentTemplateData,
  isPatientVariable,
  isPsychologistVariable,
  isSystemVariable,
  isValidVariableScope,
  MANUAL_ONLY_PATIENT_VARIABLES,
  type SerializedLexicalState,
  type SubstitutionError,
  type SubstitutionWarning,
  VARIABLE_METADATA,
  type VariableSubstitutionContext,
  type VariableScope,
} from "../types/document-templates";
import type { Database } from "@workspace/supabase-infra/types/database";

// Re-export types for convenience
export type { SubstitutionResult } from "../types/document-templates";

// ============================================
// Type Aliases
// ============================================

type PsychologistClient = Database["public"]["Tables"]["psychologist_patients"]["Row"];
type Psychologist = Database["public"]["Tables"]["user_psychologists"]["Row"];
type PatientGuardian = Database["public"]["Tables"]["psychologist_patient_guardians"]["Row"];

const PARAGRAPH_DEFAULTS = {
  type: "paragraph",
  format: "",
  indent: 0,
  direction: "ltr",
  version: 1,
  textFormat: 0,
  textStyle: "",
} as const;

const LIST_DEFAULTS = {
  type: "list",
  listType: "bullet",
  start: 1,
  tag: "ul",
  version: 1,
} as const;

const LIST_ITEM_DEFAULTS = {
  type: "listitem",
  checked: null,
  direction: null,
  format: "",
  indent: 0,
  value: 1,
  version: 1,
} as const;

function normalizeLexicalNode(node: unknown): unknown {
  if (!node || typeof node !== "object") return node;

  const nodeObj = node as Record<string, unknown>;
  const nodeType = typeof nodeObj.type === "string" ? nodeObj.type : null;
  const normalizedChildren = Array.isArray(nodeObj.children)
    ? nodeObj.children.map((child) => normalizeLexicalNode(child))
    : undefined;

  if (nodeType === "root") {
    return {
      ...nodeObj,
      type: "root",
      direction: nodeObj.direction ?? "ltr",
      format: typeof nodeObj.format === "string" ? nodeObj.format : "",
      indent: typeof nodeObj.indent === "number" ? nodeObj.indent : 0,
      version: typeof nodeObj.version === "number" ? nodeObj.version : 1,
      children: normalizedChildren ?? [],
    };
  }

  if (nodeType === "listitem") {
    const children = normalizedChildren ?? [];
    const hasNonElementChildren = children.some((child) => {
      if (!child || typeof child !== "object") return true;
      const childType = (child as Record<string, unknown>).type;
      return childType === "text" || childType === "linebreak";
    });

    const listItemChildren = hasNonElementChildren
      ? [
          {
            ...PARAGRAPH_DEFAULTS,
            children,
          },
        ]
      : children;

    return {
      ...nodeObj,
      ...LIST_ITEM_DEFAULTS,
      type: "listitem",
      value: typeof nodeObj.value === "number" ? nodeObj.value : LIST_ITEM_DEFAULTS.value,
      version: typeof nodeObj.version === "number" ? nodeObj.version : LIST_ITEM_DEFAULTS.version,
      children: listItemChildren,
    };
  }

  if (nodeType === "list") {
    const rawListType =
      typeof nodeObj.listType === "string" ? nodeObj.listType : LIST_DEFAULTS.listType;
    const normalizedListType =
      rawListType === "number" || rawListType === "bullet" || rawListType === "check"
        ? rawListType
        : LIST_DEFAULTS.listType;
    const tag = normalizedListType === "number" ? "ol" : "ul";

    return {
      ...nodeObj,
      ...LIST_DEFAULTS,
      type: "list",
      listType: normalizedListType,
      start: typeof nodeObj.start === "number" ? nodeObj.start : LIST_DEFAULTS.start,
      tag,
      version: typeof nodeObj.version === "number" ? nodeObj.version : LIST_DEFAULTS.version,
      children: (normalizedChildren ?? []).map((child) => {
        if (!child || typeof child !== "object") return child;
        const childObj = child as Record<string, unknown>;
        if (childObj.type === "listitem") return child;
        return {
          ...LIST_ITEM_DEFAULTS,
          children: [
            {
              ...PARAGRAPH_DEFAULTS,
              children: [childObj],
            },
          ],
        };
      }),
    };
  }

  if (nodeType === "paragraph") {
    return {
      ...nodeObj,
      ...PARAGRAPH_DEFAULTS,
      children: normalizedChildren ?? [],
    };
  }

  if (normalizedChildren) {
    return {
      ...nodeObj,
      children: normalizedChildren,
    };
  }

  return nodeObj;
}

function normalizeLexicalState(state: unknown): SerializedLexicalState | null {
  if (!state || typeof state !== "object") return null;
  const stateObj = state as Record<string, unknown>;
  if (!stateObj.root || typeof stateObj.root !== "object") return null;

  const normalizedRoot = normalizeLexicalNode(stateObj.root);
  if (!normalizedRoot || typeof normalizedRoot !== "object") return null;

  const rootObj = normalizedRoot as Record<string, unknown>;
  const rootChildren: unknown[] = Array.isArray(rootObj.children) ? rootObj.children : [];

  const extractPlainText = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const nodeObj = node as Record<string, unknown>;
    if (nodeObj.type === "text" && typeof nodeObj.text === "string") {
      return nodeObj.text;
    }
    if (Array.isArray(nodeObj.children)) {
      return nodeObj.children
        .map((child) => extractPlainText(child))
        .join(" ")
        .trim();
    }
    return "";
  };

  const normalizeListAsParagraphs = (
    listNode: Record<string, unknown>,
  ): Record<string, unknown>[] => {
    const listType =
      typeof listNode.listType === "string" && listNode.listType === "number" ? "number" : "bullet";
    const listChildren = Array.isArray(listNode.children) ? listNode.children : [];
    let itemIndex = 1;

    const items: Record<string, unknown>[] = [];
    for (const item of listChildren) {
      if (!item || typeof item !== "object") continue;
      const itemObj = item as Record<string, unknown>;
      const itemText = extractPlainText(itemObj);
      if (!itemText) continue;
      const prefix = listType === "number" ? `${itemIndex}. ` : "• ";
      itemIndex += 1;
      items.push({
        ...PARAGRAPH_DEFAULTS,
        children: [
          {
            type: "text",
            text: `${prefix}${itemText}`,
            format: 0,
            version: 1,
          },
        ],
      });
    }
    return items;
  };

  const flattenedChildren: unknown[] = rootChildren.flatMap((child): unknown[] => {
    if (!child || typeof child !== "object") return [];
    const childObj = child as Record<string, unknown>;
    if (childObj.type !== "list") return [childObj];
    return normalizeListAsParagraphs(childObj);
  });

  const normalizedRootObj = normalizedRoot as Record<string, unknown>;

  const root: SerializedLexicalState["root"] = {
    ...normalizedRootObj,
    type: "root",
    direction: (normalizedRootObj.direction as string) ?? "ltr",
    format: typeof normalizedRootObj.format === "string" ? normalizedRootObj.format : "",
    indent: typeof normalizedRootObj.indent === "number" ? normalizedRootObj.indent : 0,
    version: typeof normalizedRootObj.version === "number" ? normalizedRootObj.version : 1,
    children: flattenedChildren as SerializedLexicalState["root"]["children"],
  };

  return { root };
}

// ============================================
// Date Formatting Utilities
// ============================================

const MONTH_NAMES_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function formatDate(date: Date, format: "short" | "extended" | "datetime" = "short"): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  switch (format) {
    case "extended":
      return `${day} de ${MONTH_NAMES_PT[date.getMonth()]} de ${year}`;
    case "datetime":
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

function formatDateFromString(dateString: string | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return formatDate(date, "short");
  } catch {
    return "";
  }
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  try {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
}

// ============================================
// CRP State Code Mapping
// ============================================

const CRP_STATE_CODES: Record<string, string> = {
  AC: "01",
  AL: "02",
  AP: "03",
  AM: "04",
  BA: "05",
  CE: "06",
  DF: "07",
  ES: "08",
  GO: "09",
  MA: "10",
  MT: "11",
  MS: "12",
  MG: "13",
  PA: "14",
  PB: "15",
  PR: "16",
  PE: "17",
  PI: "18",
  RJ: "19",
  RN: "20",
  RS: "21",
  RO: "22",
  RR: "23",
  SC: "24",
  SP: "06", // SP usa 06
  SE: "25",
  TO: "26",
};

function formatCRPFull(crp: string | null, crpState: string | null): string {
  if (!crp) return "";
  // Se o CRP já contém o formato "XX/YYYYY", retorna diretamente
  if (/^\d{2}\//.test(crp)) {
    return `CRP ${crp}`;
  }
  const stateCode = crpState ? (CRP_STATE_CODES[crpState.toUpperCase()] ?? crpState) : "";
  return stateCode ? `CRP ${stateCode}/${crp}` : `CRP ${crp}`;
}

// ============================================
// Build Substitution Context
// ============================================

export interface BuildContextParams {
  patient: PsychologistClient;
  psychologist: Psychologist;
  guardian?: PatientGuardian | null;
}

type PatientTemplateField = PsychologistClient & Record<string, unknown>;

/**
 * Builds the substitution context from patient and psychologist data.
 */
export function buildSubstitutionContext(params: BuildContextParams): VariableSubstitutionContext {
  const { patient, psychologist, guardian } = params;
  const patientFields = patient as PatientTemplateField;

  const normalizeNullableText = (value: string | null): string | null => {
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const patientText = (keys: string[]): string | null => {
    for (const key of keys) {
      const value = patientFields[key];
      if (typeof value !== "string") continue;
      const normalized = normalizeNullableText(value);
      if (normalized) return normalized;
    }

    return null;
  };

  const dateOfBirth = patientText(["date_of_birth", "manual_date_of_birth", "synced_date_of_birth"]);
  const age = calculateAge(dateOfBirth);
  const isMinor = patient.is_minor ?? (age !== null && age < 18);

  const now = new Date();

  const firstName = patientText(["first_name", "manual_first_name"]);
  const lastName = patientText(["last_name", "manual_last_name"]);
  const preferredName = patientText(["preferred_name", "manual_preferred_name"]);
  const displayName = patientText(["display_name", "manual_display_name", "synced_display_name"]);
  const fullNameFromParts =
    [firstName, lastName]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(" ") || null;
  const fullName =
    patientText(["full_name", "manual_full_name", "synced_full_name"]) ??
    displayName ??
    fullNameFromParts;

  const context: VariableSubstitutionContext = {
    patient: {
      // Identification data
      fullName,
      displayName: displayName ?? preferredName ?? fullName?.split(" ")[0] ?? null,
      email: patientText(["email", "manual_email", "synced_email"]),
      phone: patientText(["phone", "manual_phone", "synced_phone"]),
      cpf: patientText(["cpf", "manual_cpf", "synced_cpf"]),
      rg: patientText(["rg", "manual_rg", "synced_rg"]),

      // Demographic data
      dateOfBirth: formatDateFromString(dateOfBirth),
      age,
      gender: patientText(["gender", "manual_gender", "synced_gender"]),
      pronouns: patientText(["pronouns", "manual_pronouns", "synced_pronouns"]),
      placeOfBirth: patientText(["place_of_birth", "manual_place_of_birth", "synced_place_of_birth"]),
      profession: patientText(["profession", "manual_profession", "synced_profession"]),

      // Clinical data
      isMinor,
      guardianName: guardian?.full_name ?? null,
      initialComplaint: patient.initial_complaint,
      clinicalHypothesis: patient.clinical_hypothesis,
      treatmentPlan: patient.treatment_plan,

      // Dados do relacionamento
      relationshipStartDate: formatDateFromString(patient.relationship_start_date),
      firstSessionDate: formatDateFromString(patient.first_session_date),
      lastSessionDate: formatDateFromString(patient.last_session_date),
      totalSessionsCount: patient.total_sessions_count,
    },

    psychologist: {
      fullName:
        normalizeNullableText(psychologist.full_name) ??
        ([psychologist.first_name, psychologist.last_name]
          .map((v) => v?.trim())
          .filter(Boolean)
          .join(" ") ||
          null),
      displayName:
        psychologist.display_name ??
        psychologist.full_name?.split(" ")[0] ??
        psychologist.first_name ??
        null,
      crp: psychologist.crp,
      crpState: psychologist.crp_state,
      crpFull: formatCRPFull(psychologist.crp, psychologist.crp_state),
      phone: psychologist.phone,
      cpf: psychologist.cpf == null ? null : String(psychologist.cpf),
    },

    system: {
      currentDate: formatDate(now, "short"),
      currentDateExtended: formatDate(now, "extended"),
      currentDatetime: formatDate(now, "datetime"),
      currentYear: String(now.getFullYear()),
      currentMonth: String(now.getMonth() + 1).padStart(2, "0"),
      currentMonthName: MONTH_NAMES_PT[now.getMonth()] ?? "mês desconhecido",
    },
  };

  return context;
}

// ============================================
// Variable Substitution
// ============================================

/**
 * Regex to find variables in format {{scope.field}}
 * Captures: $1 = scope (patient|psychologist|system), $2 = field
 */
const VARIABLE_REGEX = /\{\{(patient|psychologist|system)\.(\w+)\}\}/g;

function formatFallbackVariableLabel(field: string): string {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
}

function getVariableLabel(scope: VariableScope, field: string): string {
  const metadata = VARIABLE_METADATA[scope].find((entry) => entry.key === field);
  return metadata?.label ?? formatFallbackVariableLabel(field);
}

/**
 * Retorna o label de uma variável manual-only (que não existe no banco).
 * Retorna null se não for encontrada.
 */
function getManualOnlyVariableLabel(scope: string, field: string): string | null {
  if (scope === "patient" && field in MANUAL_ONLY_PATIENT_VARIABLES) {
    return MANUAL_ONLY_PATIENT_VARIABLES[field]?.label ?? null;
  }
  return null;
}

/**
 * Substitutes variables in text.
 * Returns text with substituted variables and lists of warnings/errors.
 */
function substituteInText(
  text: string,
  context: VariableSubstitutionContext,
): {
  result: string;
  warnings: SubstitutionWarning[];
  errors: SubstitutionError[];
} {
  const warnings: SubstitutionWarning[] = [];
  const errors: SubstitutionError[] = [];
  let processedText = text;

  // Regex for conditionals: {{#if scope.field}}...{{/if}}
  // Non-greedy match for content
  const CONDITIONAL_REGEX = /{{\s*#if\s+([a-zA-Z0-9_.]+)\s*}}([\s\S]*?){{\s*\/if\s*}}/g;

  // 1. Process conditionals first
  processedText = processedText.replace(
    CONDITIONAL_REGEX,
    (fullMatch: string, variablePath: string, content: string) => {
      const [scope, field] = variablePath.split(".");

      if (!scope || !field || !isValidVariableScope(scope)) {
        errors.push({
          variable: fullMatch,
          message: `Escopo inválido em condicional: ${scope}`,
          code: "INVALID_SCOPE",
        });
        return fullMatch;
      }

      // Validate field
      const isValidField =
        (scope === "patient" && isPatientVariable(field)) ||
        (scope === "psychologist" && isPsychologistVariable(field)) ||
        (scope === "system" && isSystemVariable(field));

      if (!isValidField) {
        errors.push({
          variable: fullMatch,
          message: `Variável desconhecida em condicional: ${field}`,
          code: "MISSING_VARIABLE",
        });
        return fullMatch;
      }

      const scopeContext = context[scope as keyof VariableSubstitutionContext];
      const value = scopeContext[field as keyof typeof scopeContext];

      // Evaluate condition (truthy/falsy)
      // For booleans, true is true.
      // For strings, non-empty is true.
      // For null/undefined, it's false.
      const isTrue = !!value;

      if (isTrue) {
        return content;
      } else {
        return "";
      }
    },
  );

  const result = processedText.replace(
    VARIABLE_REGEX,
    (fullMatch, scope: string, field: string) => {
      // Validate scope
      if (!isValidVariableScope(scope)) {
        errors.push({
          variable: fullMatch,
          message: `Escopo inválido: ${scope}`,
          code: "INVALID_SCOPE",
        });
        return fullMatch; // Manter original em caso de erro
      }

      // Validar field
      const isValidField =
        (scope === "patient" && isPatientVariable(field)) ||
        (scope === "psychologist" && isPsychologistVariable(field)) ||
        (scope === "system" && isSystemVariable(field));

      if (!isValidField) {
        // Verifica se é uma variável manual-only (não existe no banco, mas é conhecida)
        const manualLabel = getManualOnlyVariableLabel(scope, field);
        if (manualLabel) {
          const placeholder = `[${manualLabel} não informado]`;
          warnings.push({
            variable: fullMatch,
            message: `Variável ${scope}.${field} requer preenchimento manual`,
            replacedWith: placeholder,
          });
          return placeholder;
        }

        // Variável realmente desconhecida
        errors.push({
          variable: fullMatch,
          message: `Variável desconhecida: ${field} no escopo ${scope}`,
          code: "MISSING_VARIABLE",
        });
        return fullMatch;
      }

      // Get value from context
      const scopeContext = context[scope as keyof VariableSubstitutionContext];
      const value = scopeContext[field as keyof typeof scopeContext];

      // If value is null, undefined or empty string
      if (value === null || value === undefined || value === "") {
        const label = getVariableLabel(scope, field);
        const placeholder = `[${label} não informado]`;
        warnings.push({
          variable: fullMatch,
          message: `Variável ${scope}.${field} não tem valor definido`,
          replacedWith: placeholder,
        });
        return placeholder;
      }

      // Converter para string
      if (typeof value === "boolean") {
        return value ? "Sim" : "Não";
      }

      return String(value);
    },
  );

  return { result, warnings, errors };
}

/**
 * Walker recursivo para processar todos os nós de texto em um estado Lexical.
 */
function walkLexicalNode(
  node: unknown,
  context: VariableSubstitutionContext,
  warnings: SubstitutionWarning[],
  errors: SubstitutionError[],
): void {
  if (!node || typeof node !== "object") return;

  const nodeObj = node as Record<string, unknown>;

  // If it's a text node, substitute variables
  if (nodeObj.type === "text" && typeof nodeObj.text === "string") {
    const substitution = substituteInText(nodeObj.text, context);
    nodeObj.text = substitution.result;
    warnings.push(...substitution.warnings);
    errors.push(...substitution.errors);
  }

  // Recursivo para children
  if (Array.isArray(nodeObj.children)) {
    for (const child of nodeObj.children) {
      walkLexicalNode(child, context, warnings, errors);
    }
  }
}

/**
 * Substitui todas as variáveis {{scope.field}} em um template Lexical.
 *
 * @param templateData - O template_data do documento
 * @param context - Contexto com dados do paciente, psicólogo e sistema
 * @returns Resultado da substituição com conteúdo processado e warnings/errors
 */
export function substituteTemplateVariables(
  templateData: DocumentTemplateData,
  context: VariableSubstitutionContext,
): {
  substitutedContent: SerializedEditor;
  warnings: SubstitutionWarning[];
  errors: SubstitutionError[];
  success: boolean;
} {
  const warnings: SubstitutionWarning[] = [];
  const errors: SubstitutionError[] = [];

  // Deep clone to not mutate the original
  const substitutedContent = JSON.parse(JSON.stringify(templateData.content)) as SerializedEditor;

  // Process from root node
  if (substitutedContent.root) {
    walkLexicalNode(substitutedContent.root, context, warnings, errors);
  }

  return {
    substitutedContent,
    warnings,
    errors,
    success: errors.length === 0,
  };
}

// ============================================
// Extract Variables from Template
// ============================================

/**
 * Extrai todas as variáveis {{scope.field}} usadas em um template.
 * Útil para validação e exibição de variáveis requeridas.
 *
 * @param templateData - O template_data do documento
 * @returns Array de strings no formato "scope.field"
 */
export function extractVariablesFromTemplate(templateData: DocumentTemplateData): string[] {
  const variables = new Set<string>();

  function walkNode(node: unknown): void {
    if (!node || typeof node !== "object") return;

    const nodeObj = node as Record<string, unknown>;

    // If it's a text node, extract variables
    if (nodeObj.type === "text" && typeof nodeObj.text === "string") {
      const matches = nodeObj.text.matchAll(VARIABLE_REGEX);
      for (const match of matches) {
        variables.add(`${match[1]}.${match[2]}`);
      }
    }

    // Recursivo para children
    if (Array.isArray(nodeObj.children)) {
      for (const child of nodeObj.children) {
        walkNode(child);
      }
    }
  }

  walkNode(templateData.content);

  return Array.from(variables).sort();
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Valida se um template_data tem a estrutura correta.
 */
export function validateTemplateData(data: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("template_data deve ser um objeto");
    return { isValid: false, errors };
  }

  const templateData = data as Record<string, unknown>;

  // Validar version
  if (templateData.version !== "1.0") {
    const version =
      typeof templateData.version === "string" || typeof templateData.version === "number"
        ? String(templateData.version)
        : "desconhecida";
    errors.push(`Versão inválida ou não suportada: ${version}`);
  }

  // Validar content
  if (!templateData.content || typeof templateData.content !== "object") {
    errors.push("content é obrigatório e deve ser um estado Lexical válido");
  } else {
    const content = templateData.content as Record<string, unknown>;
    if (!content.root || typeof content.root !== "object") {
      errors.push("content.root é obrigatório");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Converte template_data legado (apenas content) para o novo formato.
 */
export function normalizeTemplateData(data: unknown): DocumentTemplateData | null {
  if (!data) return null;

  // If already in new format
  if (typeof data === "object" && "version" in data && "content" in data) {
    const candidate = data as Record<string, unknown>;
    const content = candidate.content;

    if (content && typeof content === "object" && "root" in content) {
      const normalizedContent = normalizeLexicalState(content);
      if (!normalizedContent) return null;
      return {
        ...(data as DocumentTemplateData),
        version: "1.0",
        content: normalizedContent,
      };
    }

    // Defensive handling for legacy nested shapes:
    // { version: "1.0", content: { version: "1.0", content: { root: ... } } }
    if (
      content &&
      typeof content === "object" &&
      "content" in content &&
      (content as Record<string, unknown>).content &&
      typeof (content as Record<string, unknown>).content === "object"
    ) {
      const nested = (content as Record<string, unknown>).content as Record<string, unknown>;
      if ("root" in nested) {
        const normalizedContent = normalizeLexicalState(nested);
        if (!normalizedContent) return null;
        return {
          version: "1.0",
          content: normalizedContent,
        };
      }
    }

    return null;
  }

  // If it's a direct Lexical state (legacy format)
  if (typeof data === "object" && "root" in data) {
    const normalizedContent = normalizeLexicalState(data);
    if (!normalizedContent) return null;
    return {
      version: "1.0",
      content: normalizedContent,
    };
  }

  return null;
}
