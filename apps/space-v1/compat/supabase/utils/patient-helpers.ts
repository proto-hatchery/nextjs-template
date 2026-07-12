/**
 * Utility functions for patient data manipulation
 */

/**
 * Extracts the first name from a full name string.
 * Handles edge cases like empty strings, single names, and compound names.
 *
 * @param displayName - The full name or display name of the patient
 * @returns The first name extracted from the display name
 *
 * @example
 * getFirstName("João Silva") // returns "João"
 * getFirstName("Maria") // returns "Maria"
 * getFirstName("José da Silva") // returns "José"
 * getFirstName("") // returns ""
 */
export function getFirstName(displayName: string): string {
  if (!displayName || typeof displayName !== "string") {
    return "";
  }

  const trimmed = displayName.trim();
  if (!trimmed) {
    return "";
  }

  // Split by spaces and get the first word
  const parts = trimmed.split(/\s+/);
  return parts[0] || "";
}

/**
 * Normalizes a string by removing accents and converting to lowercase.
 * Used for case-insensitive and accent-insensitive string comparisons.
 *
 * @param str - The string to normalize
 * @returns The normalized string (lowercase, no accents)
 *
 * @example
 * normalizeString("João") // returns "joao"
 * normalizeString("María") // returns "maria"
 * normalizeString("JOSÉ") // returns "jose"
 */
export function normalizeString(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Compares two strings in a case-insensitive and accent-insensitive manner.
 *
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns true if the strings match (ignoring case and accents), false otherwise
 *
 * @example
 * stringsMatch("João", "joao") // returns true
 * stringsMatch("María", "maria") // returns true
 * stringsMatch("José", "Jose") // returns true
 * stringsMatch("João", "Maria") // returns false
 */
export function stringsMatch(str1: string, str2: string): boolean {
  return normalizeString(str1) === normalizeString(str2);
}

/**
 * Validates if the provided input matches the patient's first name.
 * Used for deletion confirmation dialogs.
 *
 * @param input - The user input to validate
 * @param displayName - The patient's display name
 * @returns true if the input matches the first name, false otherwise
 *
 * @example
 * validateFirstNameMatch("joao", "João Silva") // returns true
 * validateFirstNameMatch("João", "João Silva") // returns true
 * validateFirstNameMatch("Silva", "João Silva") // returns false
 */
export function validateFirstNameMatch(input: string, displayName: string): boolean {
  const firstName = getFirstName(displayName);
  return stringsMatch(input, firstName);
}
