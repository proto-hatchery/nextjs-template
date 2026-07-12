export type EventFamily = "security_audit" | "operational" | "stripe_webhook";

export type Environment = "local" | "dev" | "stg" | "prod";

export type ActorType = "anonymous" | "authenticated" | "system" | "service-role";

export type Outcome =
  | "success"
  | "failure"
  | "error"
  | "timeout"
  | "circuit_open"
  | "rate_limited"
  | "received"
  | "processed";

export interface UnifiedEvent {
  id?: string;
  event_family: EventFamily;
  event_name: string;
  timestamp?: string;
  trace_id?: string;
  correlation_id?: string | null;
  service: string;
  component: string;
  environment: Environment;
  actor_type: ActorType;
  actor_id_hash?: string | null;
  role?: string | null;
  operation: string;
  operation_type: string;
  outcome: Outcome;
  error_category?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, unknown>;
  sample_rate?: number;
  force_keep?: boolean;
  retention_days?: number;
  request_path?: string | null;
  http_status?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export type BaseEvent = Omit<
  UnifiedEvent,
  | "id"
  | "timestamp"
  | "trace_id"
  | "environment"
  | "service"
  | "sample_rate"
  | "force_keep"
  | "retention_days"
>;
