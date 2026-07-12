import { createHash } from "node:crypto";

/**
 * Redaction utility for PII (Personally Identifiable Information).
 */

/**
 * Deterministically hashes PII strings for tracking without exposure.
 * @param value The value to hash (e.g., email, user ID, IP address).
 * @param salt Optional salt (defaults to a fixed project-level salt if not provided).
 */
export function hashPII(
  value: string | null | undefined,
  salt: string = "fluri-obs-salt",
): string | null {
  if (!value) return null;
  return createHash("sha256").update(`${value}:${salt}`).digest("hex");
}

/**
 * Redacts common sensitive keys from metadata objects.
 */
export function redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = [
    "password",
    "token",
    "secret",
    "key",
    "auth",
    "cookie",
    "session",
    "card",
    "cvv",
    "cvc",
  ];

  const redacted: Record<string, unknown> = { ...metadata };

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase();
    const value = redacted[key];
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactMetadata(value as Record<string, unknown>);
    }
  }

  return redacted;
}

/**
 * Serializes unknown errors into stable human-readable strings.
 */
export function serializeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "object" && err !== null) {
    return JSON.stringify(err);
  }
  return String(err);
}
