export const CRP_REGION_DIGITS = 2;
export const CRP_NUMBER_MIN_DIGITS = 3;
export const CRP_NUMBER_MAX_DIGITS = 6;
export const CRP_SUFFIX_DIGITS = 1;
export const CRP_MAX_TOTAL_DIGITS = CRP_REGION_DIGITS + CRP_NUMBER_MAX_DIGITS + CRP_SUFFIX_DIGITS;

export const CRP_FORMATTED_REGEX = /^\d{2}\/\d{3,6}(?:-\d)?$/;
export const CRP_MASK_PLACEHOLDER = "00/000000-0";
export const CRP_FORMAT_HELPER_TEXT = "Formatos aceitos: 00/123, 00/123456 ou 00/12345-6.";
export const CRP_FORMAT_ERROR_MESSAGE =
  "CRP deve estar em um destes formatos: XX/XXX, XX/XXXXXX ou XX/XXXXX-X";

const cleanCrpInput = (value: string | undefined): string => (value ?? "").replace(/[^\d/-]/g, "");

export const formatCrp = (value: string | undefined): string => {
  const rawValue = cleanCrpInput(value);
  const digits = rawValue.replace(/\D/g, "");

  if (digits.length <= CRP_REGION_DIGITS) {
    return digits;
  }

  const region = digits.slice(0, CRP_REGION_DIGITS);
  const tailSource = rawValue.includes("/") ? rawValue.slice(rawValue.indexOf("/") + 1) : "";
  const hasExplicitSuffix = tailSource.includes("-");

  if (!hasExplicitSuffix) {
    return `${region}/${digits.slice(
      CRP_REGION_DIGITS,
      CRP_REGION_DIGITS + CRP_NUMBER_MAX_DIGITS,
    )}`;
  }

  const [mainPart = "", suffixPart = ""] = tailSource.split("-", 2);
  const mainDigits = mainPart.replace(/\D/g, "").slice(0, CRP_NUMBER_MAX_DIGITS);
  const suffixDigit = suffixPart.replace(/\D/g, "").slice(0, CRP_SUFFIX_DIGITS);

  if (!suffixDigit) {
    return `${region}/${mainDigits}`;
  }

  return `${region}/${mainDigits}-${suffixDigit}`;
};

export const isValidFormattedCrp = (value: string | undefined): boolean =>
  CRP_FORMATTED_REGEX.test((value ?? "").trim());

export const isValidCrpDigits = (value: string | undefined): boolean => {
  const digits = (value ?? "").replace(/\D/g, "");
  return (
    digits.length >= CRP_REGION_DIGITS + CRP_NUMBER_MIN_DIGITS &&
    digits.length <= CRP_REGION_DIGITS + CRP_NUMBER_MAX_DIGITS
  );
};
