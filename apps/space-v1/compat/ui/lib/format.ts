function formatCurrency(value: number | null | undefined): string {
  const cents = value == null || Number.isNaN(value) ? 0 : value;

  return (cents / 100).toLocaleString("pt-BR", {
    currency: "BRL",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  });
}

function formatPhoneForDisplay(value: string | null | undefined): string {
  if (!value) return "";

  const digits = value.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) {
    return `(${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return value;
}

export { formatCurrency, formatPhoneForDisplay };
