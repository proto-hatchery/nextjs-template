/**
 * PHI Audit Log Sanitization
 *
 * HIPAA §164.312(b) compliant audit logging for Server Actions.
 *
 * ## Why This Exists
 *
 * VIOLATION: `errorMetadata: ["input"]` on PHI tables logs raw patient data on
 * action failure. HIPAA §164.312(b) prohibits logging PHI content in application
 * logs. Audit logs must capture WHO/WHAT/WHEN, not the data content.
 *
 * ## Compliance Requirements
 *
 * Audit logs for HIPAA must capture:
 * - WHO accessed the data (userId, actorId)
 * - WHAT operation was performed (action name, operation type)
 * - WHEN it happened (timestamp)
 * - Outcome (success/failure)
 *
 * Audit logs must NOT contain:
 * - Patient names
 * - Dates of birth
 * - Medical record numbers
 * - Treatment details
 * - Any other PHI content
 *
 * ## Usage
 *
 * ```typescript
 * import { sanitizeForAudit } from "@workspace/supabase-data/lib/audit/sanitize-phi"
 *
 * const AUDIT_SAFE_FIELDS = ["id", "psychologistId", "createdAt"] as const
 *
 * // In error handler:
 * await logServerEvent({
 *   // ... other fields
 *   metadata: sanitizeForAudit(input, AUDIT_SAFE_FIELDS)
 * })
 * ```
 *
 * @see {@link https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html} - HIPAA Security Rule
 */
import "server-only"

/**
 * Sanitize input for audit logging
 *
 * Filters input object to only include audit-safe fields, removing all PHI.
 * Adds metadata about sanitization for compliance verification.
 *
 * @param input - Raw input object (may contain PHI)
 * @param auditSafeFields - Allowlist of field names safe for audit logs
 * @returns Sanitized object with only audit-safe fields + metadata
 *
 * @example
 * ```typescript
 * const input = { fullName: "John Doe", dateOfBirth: "1990-01-01", id: "123" }
 * const AUDIT_SAFE_FIELDS = ["id", "createdAt"] as const
 *
 * const sanitized = sanitizeForAudit(input, AUDIT_SAFE_FIELDS)
 * // Returns: { _sanitized: true, _fieldCount: 3, id: "123" }
 * // Note: fullName and dateOfBirth are removed (PHI)
 * ```
 */
export function sanitizeForAudit<T extends Record<string, unknown>>(
  input: T,
  auditSafeFields: readonly string[]
): Record<string, unknown> {
  return {
    _sanitized: true,
    _fieldCount: Object.keys(input).length,
    ...Object.fromEntries(Object.entries(input).filter(([key]) => auditSafeFields.includes(key))),
  }
}

/**
 * Type for sanitized audit metadata
 *
 * Enforces that metadata passed to logServerEvent for PHI tables
 * has been through sanitizeForAudit().
 */
export type SanitizedAuditMetadata = {
  _sanitized: true
  _fieldCount: number
  [key: string]: unknown
}

/**
 * Type guard for sanitized metadata
 *
 * @param metadata - Object to check
 * @returns True if metadata has been sanitized
 */
export function isSanitizedAuditMetadata(
  metadata: Record<string, unknown>
): metadata is SanitizedAuditMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "_sanitized" in metadata &&
    metadata._sanitized === true &&
    "_fieldCount" in metadata &&
    typeof metadata._fieldCount === "number"
  )
}
