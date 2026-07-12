import type {
  EventFamily,
  Environment,
  ActorType,
  Outcome,
  UnifiedEvent,
  BaseEvent,
} from "./types";
import { hashPII, redactMetadata, serializeError } from "./redaction";
import { emitEvent } from "./storage";
import { StripeEmitter, SecurityEmitter, OperationalEmitter } from "./emitters";
import { logActionEvent, logWarning, logSuccess, logFailure } from "./action-logger";
import { createDevLogger } from "./dev-logger";
import {
  CorrelationStore,
  getCorrelationContext,
  isAgentHarnessEnabled,
  type CorrelationContext,
} from "./correlation-store";

export type {
  EventFamily,
  Environment,
  ActorType,
  Outcome,
  UnifiedEvent,
  BaseEvent,
  CorrelationContext,
};
export {
  hashPII,
  redactMetadata,
  serializeError,
  emitEvent,
  StripeEmitter,
  SecurityEmitter,
  OperationalEmitter,
  logActionEvent,
  logWarning,
  logSuccess,
  logFailure,
  createDevLogger,
  CorrelationStore,
  getCorrelationContext,
  isAgentHarnessEnabled,
};
