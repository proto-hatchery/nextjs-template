export const normalizeStringValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export const normalizeOptionalStringValue = (value: unknown): string | undefined => {
  const normalized = normalizeStringValue(value);
  return normalized.length === 0 ? undefined : normalized;
};

export const normalizeNullableValue = <T>(value: T | null | undefined, fallback: T): T => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return value;
};

export const toRHFEmptyString = (value: string | undefined | null): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return value;
};

export const toOptionalSelectValue = (value: string | undefined | null): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
};
