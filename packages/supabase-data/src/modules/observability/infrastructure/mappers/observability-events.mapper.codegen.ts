// codegen:backend — do not hand-edit; regenerate with `pnpm codegen:backend --write`.

import {
  ObservabilityEventsDTOSchema,
  type ObservabilityEventsDTO,
} from "@workspace/supabase-data/modules/observability/domain/dto/observability-events.dto.codegen"
import type { Database } from "@workspace/supabase-infra/types/database"

type ObservabilityEventsRow = Database["public"]["Views"]["v_operational_events"]["Row"]

const ObservabilityEventsFieldMappings = {
  actorIdHash: "actor_id_hash",
  actorType: "actor_type",
  component: "component",
  correlationId: "correlation_id",
  durationMs: "duration_ms",
  environment: "environment",
  errorCategory: "error_category",
  errorCode: "error_code",
  errorMessage: "error_message",
  eventFamily: "event_family",
  eventName: "event_name",
  forceKeep: "force_keep",
  httpStatus: "http_status",
  id: "id",
  ipAddress: "ip_address",
  metadata: "metadata",
  operation: "operation",
  operationType: "operation_type",
  outcome: "outcome",
  requestPath: "request_path",
  retentionDays: "retention_days",
  role: "role",
  sampleRate: "sample_rate",
  service: "service",
  timestamp: "timestamp",
  traceId: "trace_id",
  userAgent: "user_agent",
} as const

type _ObservabilityEventsField = keyof typeof ObservabilityEventsFieldMappings

function fromObservabilityEventsRow(row: ObservabilityEventsRow): ObservabilityEventsDTO {
  const mapped = {
    actorIdHash: row.actor_id_hash,
    actorType: row.actor_type,
    component: row.component,
    correlationId: row.correlation_id,
    durationMs: row.duration_ms,
    environment: row.environment,
    errorCategory: row.error_category,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    eventFamily: row.event_family,
    eventName: row.event_name,
    forceKeep: row.force_keep,
    httpStatus: row.http_status,
    id: row.id,
    ipAddress: row.ip_address,
    metadata: row.metadata,
    operation: row.operation,
    operationType: row.operation_type,
    outcome: row.outcome,
    requestPath: row.request_path,
    retentionDays: row.retention_days,
    role: row.role,
    sampleRate: row.sample_rate,
    service: row.service,
    timestamp: row.timestamp,
    traceId: row.trace_id,
    userAgent: row.user_agent,
  }
  return ObservabilityEventsDTOSchema.parse(mapped)
}

export { fromObservabilityEventsRow }
