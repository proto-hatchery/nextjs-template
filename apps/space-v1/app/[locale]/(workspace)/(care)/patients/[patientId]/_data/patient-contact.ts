export function getDigits(phoneRaw?: string | null) {
  if (!phoneRaw) return "";
  return String(phoneRaw).replace(/\D/g, "");
}

export function getWhatsappHref(phoneRaw?: string | null): string | null {
  const digits = getDigits(phoneRaw);
  if (!digits || digits.length < 10) return null;
  return `https://wa.me/${digits}`;
}
