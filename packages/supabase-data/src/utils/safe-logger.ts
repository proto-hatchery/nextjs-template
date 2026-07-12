/* eslint-disable no-console */
/**
 * Safe logging + unified observability bridge.
 *
 * Behavior by environment:
 * - local/dev: logs to console (sanitized) for developer productivity.
 * - stg/prod: emits structured backend events for warn/error only.
 *
 * This avoids noisy broad logging in production while preserving critical
 * observability through unified_events.
 */

type LoggerLevel = "log" | "info" | "warn" | "error";
type RuntimeEnv = "local" | "dev" | "stg" | "prod";

const SENSITIVE_PATTERNS = [
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, replacement: "[STRIPE_LIVE_KEY]" },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, replacement: "[STRIPE_TEST_KEY]" },
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*/g, replacement: "[JWT_TOKEN]" },
  { pattern: /[a-f0-9]{32,}/gi, replacement: "[HEX_KEY]" }, // API keys, secrets
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASHED_IDENTIFIER_KEYS = ["email", "slug", "username", "phone", "ip", "user_agent"];

function getRuntimeEnv(): RuntimeEnv {
  const explicitEnv = (process.env.NEXT_PUBLIC_ENVIRONMENT || "").toLowerCase();
  if (explicitEnv === "stg" || explicitEnv === "prod" || explicitEnv === "dev") {
    return explicitEnv;
  }

  if (process.env.NODE_ENV === "production") return "prod";
  if (process.env.NODE_ENV === "test") return "local";
  return "dev";
}

function shouldLogToConsole(env: RuntimeEnv): boolean {
  return env === "local" || env === "dev";
}

function shouldEmitBackend(level: LoggerLevel, env: RuntimeEnv): boolean {
  // In stg/prod, keep signal high by emitting backend events only for warn/error.
  if (env !== "stg" && env !== "prod") return false;
  return level === "warn" || level === "error";
}

export function sanitizeForLogging(value: unknown): unknown {
  if (typeof value === "string") {
    let sanitized = value;
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForLogging);
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Also check keys for sensitive names
      if (isSensitiveKey(key)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeForLogging(val);
      }
    }
    return sanitized;
  }

  return value;
}

function isSensitiveKey(key: string): boolean {
  const sensitiveKeys = [
    "password",
    "secret",
    "token",
    "key",
    "api_key",
    "private_key",
    "service_role_key",
    "encryption_key",
  ];

  return sensitiveKeys.some((sk) => key.toLowerCase().includes(sk));
}

function extractOperation(rawMessage: unknown): string {
  if (typeof rawMessage !== "string") return "application_log";

  const bracketMatch = rawMessage.match(/^\[([^\]]+)\]/);
  if (bracketMatch?.[1]) {
    return bracketMatch[1].replace(/[^a-zA-Z0-9_:-]/g, "_").toLowerCase();
  }

  return "application_log";
}

function classifyEventFamily(operation: string): "operational" | "security_audit" {
  const securityTokens = ["auth", "security", "unauthorized", "forbidden", "session", "role"];
  return securityTokens.some((token) => operation.includes(token))
    ? "security_audit"
    : "operational";
}

function mapOutcome(level: LoggerLevel): "success" | "failure" | "error" {
  if (level === "error") return "error";
  if (level === "warn") return "failure";
  return "success";
}

function sanitizeMetadataKeysToEnglish(metadata: Record<string, unknown>): Record<string, unknown> {
  // Preserve existing keys but normalize spacing/symbols for consistent querying.
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const normalizedKey = key.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    normalized[normalizedKey] = value;
  }
  return normalized;
}

function prepareMetadata(args: unknown[]): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  if (args.length > 1) {
    metadata.details = sanitizeForLogging(args.slice(1));
  }

  const firstObjectArg = args.find((arg): arg is Record<string, unknown> =>
    Boolean(arg && typeof arg === "object"),
  );
  if (firstObjectArg) {
    Object.assign(metadata, sanitizeForLogging(firstObjectArg) as Record<string, unknown>);
  }

  return sanitizeMetadataKeysToEnglish(metadata);
}

async function hashPIIInMetadata(
  metadata: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (Object.keys(metadata).length === 0) return metadata;

  const { hashPII } = await import("../lib/observability/redaction");
  const hashed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (
      HASHED_IDENTIFIER_KEYS.some((candidate) => key.includes(candidate)) &&
      typeof value === "string" &&
      !UUID_REGEX.test(value)
    ) {
      hashed[key] = hashPII(value);
      continue;
    }

    hashed[key] = value;
  }

  return hashed;
}

async function emitStructuredEvent(level: LoggerLevel, args: unknown[]): Promise<void> {
  if (typeof window !== "undefined") return;

  const runtimeEnv = getRuntimeEnv();
  if (!shouldEmitBackend(level, runtimeEnv)) return;

  const { emitEvent } = await import("../lib/observability/storage");
  const { serializeError } = await import("../lib/observability/redaction");

  const operation = extractOperation(args[0]);
  const eventFamily = classifyEventFamily(operation);
  const metadata = await hashPIIInMetadata(prepareMetadata(args));

  const candidateError = args.find((arg) => {
    if (arg instanceof Error) return true;
    if (!arg || typeof arg !== "object") return false;
    return "message" in arg || "code" in arg || "details" in arg;
  });

  const errorCode =
    candidateError &&
    typeof candidateError === "object" &&
    candidateError !== null &&
    "code" in candidateError &&
    typeof candidateError.code === "string"
      ? candidateError.code
      : undefined;

  await emitEvent({
    event_family: eventFamily,
    event_name: `${operation}_${level}`,
    component: "safe_logger",
    actor_type: "system",
    operation,
    operation_type: "application_log",
    outcome: mapOutcome(level),
    ...(errorCode !== undefined ? { error_code: errorCode } : {}),
    ...(candidateError ? { error_message: serializeError(candidateError) } : {}),
    metadata,
  });
}

function logToConsole(level: LoggerLevel, args: unknown[]): void {
  const runtimeEnv = getRuntimeEnv();
  if (!shouldLogToConsole(runtimeEnv)) return;

  const operation = extractOperation(args[0]);
  const metadata = prepareMetadata(args);
  const baseMessage = `[${operation}] outcome=${mapOutcome(level)} level=${level}`;

  if (level === "error") {
    console.error(baseMessage, metadata);
    return;
  }
  if (level === "warn") {
    console.warn(baseMessage, metadata);
    return;
  }
  if (level === "info") {
    console.info(baseMessage, metadata);
    return;
  }
  console.log(baseMessage, metadata);
}

function write(level: LoggerLevel, args: unknown[]): void {
  logToConsole(level, args);
  void emitStructuredEvent(level, args).catch(() => {
    // Never let observability failures affect business logic.
  });
}

export const safeLogger = {
  log: (...args: unknown[]) => write("log", args),
  error: (...args: unknown[]) => write("error", args),
  warn: (...args: unknown[]) => write("warn", args),
  info: (...args: unknown[]) => write("info", args),
};
