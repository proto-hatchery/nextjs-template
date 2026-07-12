import { logClientEvent } from "@workspace/logging/client";

type LoggerLevel = "log" | "info" | "warn" | "error";

const SENSITIVE_PATTERNS = [
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, replacement: "[STRIPE_LIVE_KEY]" },
  { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, replacement: "[STRIPE_TEST_KEY]" },
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*/g, replacement: "[JWT_TOKEN]" },
  { pattern: /[a-f0-9]{32,}/gi, replacement: "[HEX_KEY]" },
];

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

async function emitStructuredEvent(level: LoggerLevel, args: unknown[]): Promise<void> {
  const operation = extractOperation(args[0]);
  const metadata = prepareMetadata(args);

  const candidateError = args.find((arg) => {
    if (arg instanceof Error) return true;
    if (!arg || typeof arg !== "object") return false;
    return "message" in arg || "code" in arg || "details" in arg;
  });

  await logClientEvent({
    component: "legacy.safe_logger",
    error: candidateError,
    eventFamily: classifyEventFamily(operation) === "security_audit" ? "security.audit" : "ui.error",
    eventName: `${operation}_${level}`,
    metadata,
    operation,
    outcome: mapOutcome(level) === "success" ? "success" : "failure",
  });
}

function write(level: LoggerLevel, args: unknown[]): void {
  void emitStructuredEvent(level, args).catch(() => {
    // Observability failures must not affect business logic.
  });
}

export const safeLogger = {
  log: (...args: unknown[]) => write("log", args),
  error: (...args: unknown[]) => write("error", args),
  warn: (...args: unknown[]) => write("warn", args),
  info: (...args: unknown[]) => write("info", args),
};
