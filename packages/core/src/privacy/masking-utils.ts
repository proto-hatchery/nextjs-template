/**
 * Mask phone number, showing only last 4 digits
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "")

  if (digits.length < 10) {
    return "*** ****-****"
  }

  const lastFour = digits.slice(-4)
  return `(**) *****-${lastFour}`
}

/**
 * Mask email, showing first character and domain
 */
export function maskEmail(value: string): string {
  const parts = value.split("@")
  if (parts.length !== 2) {
    return "***@***.***"
  }

  const [localPart, domain] = parts
  if (!localPart) {
    return "***@***.***"
  }
  const firstChar = localPart.charAt(0)
  return `${firstChar}***@${domain}`
}

/**
 * Mask CPF, showing only last 2 digits
 */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "")

  if (digits.length !== 11) {
    return "***.***.***-**"
  }

  const lastTwo = digits.slice(-2)
  return `***.***.***-${lastTwo}`
}

/**
 * Mask RG completely
 */
export function maskRg(value: string): string {
  const digits = value.replace(/\D/g, "")

  if (digits.length === 0) {
    return "********-*"
  }

  const lastDigit = digits.slice(-1)
  return `********-${lastDigit}`
}

/**
 * Mask date of birth, showing only age or completely hidden
 * Example: 15/03/1990 becomes XX-XX-XXXX format
 */
export function maskDate(value: string): string {
  if (!value) {
    return "**/**/****"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "**/**/****"
  }

  return "**/**/****"
}

/**
 * Mask full address
 */
export function maskAddress(value: string): string {
  if (!value) {
    return "[Endereço oculto]"
  }
  return "[Endereço oculto]"
}

/**
 * Generic mask that replaces all characters with asterisks
 */
export function maskFull(value: string): string {
  if (!value) {
    return "*******"
  }
  return "*".repeat(Math.min(value.length, 9))
}
