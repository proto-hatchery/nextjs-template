import { emitEvent } from "./storage";
import { hashPII, redactMetadata } from "./redaction";
import type { Outcome, ActorType } from "./types";

/**
 * Specialized emitters for common event families.
 */

/**
 * Emitter for Stripe-related events (webhooks, checkout, billing).
 */
export const StripeEmitter = {
  /**
   * Log a received or processed Stripe webhook.
   */
  async webhook(params: {
    event_name: string;
    stripe_event_id: string;
    stripe_event_type: string;
    customer_id?: string;
    subscription_id?: string;
    outcome: Outcome;
    error_message?: string;
    duration_ms?: number;
    metadata?: Record<string, unknown>;
    trace_id?: string;
    correlation_id?: string;
  }) {
    await emitEvent({
      event_family: "stripe_webhook",
      event_name: params.event_name,
      component: "stripe-handler",
      actor_type: "system",
      operation: params.stripe_event_type,
      operation_type: "webhook_handler",
      outcome: params.outcome,
      ...(params.error_message !== undefined ? { error_message: params.error_message } : {}),
      ...(params.duration_ms !== undefined ? { duration_ms: params.duration_ms } : {}),
      ...(params.trace_id !== undefined ? { trace_id: params.trace_id } : {}),
      ...(params.correlation_id !== undefined ? { correlation_id: params.correlation_id } : {}),
      metadata: redactMetadata({
        ...params.metadata,
        stripe_event_id: params.stripe_event_id,
        ...(params.customer_id !== undefined ? { customer_id: params.customer_id } : {}),
        ...(params.subscription_id !== undefined
          ? { subscription_id: params.subscription_id }
          : {}),
      }),
    });
  },
};

/**
 * Emitter for security-sensitive events.
 */
export const SecurityEmitter = {
  /**
   * Log an authentication or authorization event.
   */
  async audit(params: {
    event_name: string;
    operation: string;
    outcome: Outcome;
    actor_type: ActorType;
    actor_id?: string;
    role?: string;
    resource?: string;
    error_message?: string;
    metadata?: Record<string, unknown>;
    request_path?: string;
    ip_address?: string;
    user_agent?: string;
    trace_id?: string;
    correlation_id?: string;
  }) {
    await emitEvent({
      event_family: "security_audit",
      event_name: params.event_name,
      component: "security-guard",
      actor_type: params.actor_type,
      actor_id_hash: hashPII(params.actor_id),
      ...(params.role !== undefined ? { role: params.role } : {}),
      operation: params.operation,
      operation_type: "access_control",
      outcome: params.outcome,
      ...(params.error_message !== undefined ? { error_message: params.error_message } : {}),
      ...(params.request_path !== undefined ? { request_path: params.request_path } : {}),
      ...(params.ip_address !== undefined ? { ip_address: hashPII(params.ip_address) } : {}),
      ...(params.user_agent !== undefined ? { user_agent: params.user_agent } : {}),
      ...(params.trace_id !== undefined ? { trace_id: params.trace_id } : {}),
      ...(params.correlation_id !== undefined ? { correlation_id: params.correlation_id } : {}),
      metadata: redactMetadata({
        ...params.metadata,
        ...(params.resource !== undefined ? { resource: params.resource } : {}),
      }),
    });
  },
};

/**
 * Emitter for operational metrics and health events.
 */
export const OperationalEmitter = {
  /**
   * Log a general operational event (API call, function execution, etc).
   */
  async log(params: {
    event_name: string;
    component: string;
    operation: string;
    operation_type: string;
    outcome: Outcome;
    actor_type?: ActorType;
    duration_ms?: number;
    error_code?: string;
    error_message?: string;
    metadata?: Record<string, unknown>;
    trace_id?: string;
    correlation_id?: string;
  }) {
    await emitEvent({
      event_family: "operational",
      event_name: params.event_name,
      component: params.component,
      operation: params.operation,
      operation_type: params.operation_type,
      outcome: params.outcome,
      ...(params.actor_type !== undefined ? { actor_type: params.actor_type } : {}),
      ...(params.duration_ms !== undefined ? { duration_ms: params.duration_ms } : {}),
      ...(params.error_code !== undefined ? { error_code: params.error_code } : {}),
      ...(params.error_message !== undefined ? { error_message: params.error_message } : {}),
      ...(params.trace_id !== undefined ? { trace_id: params.trace_id } : {}),
      ...(params.correlation_id !== undefined ? { correlation_id: params.correlation_id } : {}),
      metadata: redactMetadata(params.metadata || {}),
    });
  },
};
