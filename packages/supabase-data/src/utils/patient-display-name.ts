interface BuildPatientDisplayNameInput {
  name?: string | null | undefined;
  surname?: string | null | undefined;
  preferredName?: string | null | undefined;
}

function normalizeNamePart(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function splitNameParts(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

function getLastWord(value: string): string | null {
  const parts = splitNameParts(value);
  return parts.length > 0 ? (parts[parts.length - 1] ?? null) : null;
}

export function isCompoundName(value?: string | null): boolean {
  const normalized = normalizeNamePart(value);
  if (!normalized) return false;
  return splitNameParts(normalized).length >= 2;
}

export function buildPatientDisplayName({
  name,
  surname,
  preferredName,
}: BuildPatientDisplayNameInput): string | null {
  const normalizedPreferredName = normalizeNamePart(preferredName);
  const normalizedName = normalizeNamePart(name);
  const normalizedSurname = normalizeNamePart(surname);
  const baseName = normalizedPreferredName ?? normalizedName;

  if (!baseName) return null;

  if (isCompoundName(baseName)) {
    return baseName;
  }

  const surnameLastWord = normalizedSurname ? getLastWord(normalizedSurname) : null;
  if (!surnameLastWord) {
    return baseName;
  }

  return `${baseName} ${surnameLastWord}`;
}
