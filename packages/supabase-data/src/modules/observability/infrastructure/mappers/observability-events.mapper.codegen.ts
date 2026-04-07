// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import type { Database } from "@workspace/supabase-infra/types/database"

import { ObservabilityEventsDTOSchema, type ObservabilityEventsDTO } from "@workspace/supabase-data/modules/observability/domain/dto/observability-events.dto.codegen"

type ObservabilityEventsRow = Database["public"]["Tables"]["observability_events"]["Row"]
type ObservabilityEventsInsert = Database["public"]["Tables"]["observability_events"]["Insert"]
type ObservabilityEventsUpdate = Database["public"]["Tables"]["observability_events"]["Update"]

const ObservabilityEventsFieldMappings = {
  actorIdHash: "actor_id_hash",
  actorType: "actor_type",
  component: "component",
  correlationId: "correlation_id",
  correlationProvenance: "correlation_provenance",
  durationMs: "duration_ms",
  environment: "environment",
  errorCategory: "error_category",
  errorCode: "error_code",
  errorMessage: "error_message",
  eventFamily: "event_family",
  eventName: "event_name",
  httpStatus: "http_status",
  id: "id",
  ipHash: "ip_hash",
  metadata: "metadata",
  operation: "operation",
  operationType: "operation_type",
  outcome: "outcome",
  requestPath: "request_path",
  role: "role",
  runtime: "runtime",
  service: "service",
  severity: "severity",
  timestamp: "timestamp",
  traceId: "trace_id",
  userAgent: "user_agent",
} as const

type ObservabilityEventsField = keyof typeof ObservabilityEventsFieldMappings

function fromObservabilityEventsRow(row: ObservabilityEventsRow): ObservabilityEventsDTO {
  const mapped = {
    actorIdHash: row.actor_id_hash,
    actorType: row.actor_type,
    component: row.component,
    correlationId: row.correlation_id,
    correlationProvenance: row.correlation_provenance,
    durationMs: row.duration_ms,
    environment: row.environment,
    errorCategory: row.error_category,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    eventFamily: row.event_family,
    eventName: row.event_name,
    httpStatus: row.http_status,
    id: row.id,
    ipHash: row.ip_hash,
    metadata: row.metadata,
    operation: row.operation,
    operationType: row.operation_type,
    outcome: row.outcome,
    requestPath: row.request_path,
    role: row.role,
    runtime: row.runtime,
    service: row.service,
    severity: row.severity,
    timestamp: row.timestamp,
    traceId: row.trace_id,
    userAgent: row.user_agent,
  }
  return ObservabilityEventsDTOSchema.parse(mapped)
}

function toObservabilityEventsInsert(dto: Partial<ObservabilityEventsDTO>): ObservabilityEventsInsert {
  const out: Record<string, unknown> = {}
  for (const [camelKey, snakeKey] of Object.entries(ObservabilityEventsFieldMappings) as Array<
    [ObservabilityEventsField, (typeof ObservabilityEventsFieldMappings)[ObservabilityEventsField]]
  >) {
    const value = dto[camelKey]
    if (typeof value !== "undefined") {
      // @type-escape: generated Insert payload assigns optional DTO fields to snake_case keys
      out[snakeKey] = value as never
    }
  }
  return out as ObservabilityEventsInsert
}

function toObservabilityEventsUpdate(dto: Partial<ObservabilityEventsDTO>): ObservabilityEventsUpdate {
  return toObservabilityEventsInsert(dto) as ObservabilityEventsUpdate
}

export { fromObservabilityEventsRow, toObservabilityEventsInsert, toObservabilityEventsUpdate }
