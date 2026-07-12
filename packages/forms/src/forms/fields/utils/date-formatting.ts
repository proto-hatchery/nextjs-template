export const formatDate = (value: string): string => {
  const chars = value.replace(/\D/g, "").split("");
  const output: string[] = [];

  // Day
  if (chars.length > 0) {
    if (Number.parseInt(chars[0] || "") > 3) return ""; // First digit of day > 3 invalid
    output.push(chars[0] || "");
  }
  if (chars.length > 1) {
    const day = Number.parseInt((chars[0] || "") + (chars[1] || ""));
    if (day === 0 || day > 31) return output.join(""); // Invalid day
    output.push(chars[1] || "");
  }

  // Month
  if (chars.length > 2) {
    if (Number.parseInt(chars[2] || "") > 1) return `${output[0]}${output[1]}/`; // First digit of month > 1 invalid
    output.push(chars[2] || "");
  }
  if (chars.length > 3) {
    const month = Number.parseInt((chars[2] || "") + (chars[3] || ""));
    if (month === 0 || month > 12) return `${output[0]}${output[1]}/${output[2]}`; // Invalid month
    output.push(chars[3] || "");
  }

  // Year (free typing, up to 4 digits)
  for (let i = 4; i < 8 && i < chars.length; i += 1) {
    output.push(chars[i] || "");
  }

  const str = output.join("");
  if (str.length <= 2) return str;
  if (str.length <= 4) return `${str.slice(0, 2)}/${str.slice(2)}`;
  return `${str.slice(0, 2)}/${str.slice(2, 4)}/${str.slice(4)}`;
};

/**
 * Remove formatting from a DD/MM/YYYY date
 * @param value - String formatada
 * @returns String com apenas dígitos
 */
export const cleanDate = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Converte string DD/MM/AAAA para string YYYY-MM-DD (formato ISO sem timezone)
 * @param value - String formatada como DD/MM/AAAA
 * @returns String YYYY-MM-DD ou null se inválida
 */
export const parseDate = (value: string): string | null => {
  const digitsOnly = cleanDate(value);

  if (digitsOnly.length !== 8) {
    return null;
  }

  const day = Number.parseInt(digitsOnly.slice(0, 2), 10);
  const month = Number.parseInt(digitsOnly.slice(2, 4), 10) - 1; // month is 0-indexed
  const year = Number.parseInt(digitsOnly.slice(4, 8), 10);

  // Basic validation
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
    return null;
  }

  // Validate using Date object but return as string to avoid timezone issues
  const date = new Date(year, month, day);
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }

  // Return as YYYY-MM-DD string (PostgreSQL date format)
  const yearStr = String(year).padStart(4, "0");
  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${yearStr}-${monthStr}-${dayStr}`;
};

/**
 * Converte Date para string DD/MM/AAAA
 * @param date - Objeto Date
 * @returns String formatada como DD/MM/AAAA
 */
export const formatDateToString = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Converte string YYYY-MM-DD para DD/MM/AAAA
 * @param dateStr - String no formato YYYY-MM-DD
 * @returns String formatada como DD/MM/AAAA
 */
export const formatISODateToString = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};
