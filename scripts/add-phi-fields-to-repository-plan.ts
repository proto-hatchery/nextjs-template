#!/usr/bin/env tsx
/**
 * Add PHI field registry to repository-plan.json
 *
 * This script adds phiFields and auditSafeFields to each tenant-scoped table
 * for HIPAA §164.312(b) compliant audit logging.
 */

import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import type { RepositoryPlanEntry } from "../packages/codegen-tools/src/repository-plan-schema"

const repoRoot = join(__dirname, "..")
const repositoryPlanPath = join(repoRoot, "config/repository-plan.json")

// Read current repository-plan.json
const repositoryPlan = JSON.parse(readFileSync(repositoryPlanPath, "utf-8"))

// PHI field definitions per table
// Based on database.types.ts analysis
const phiFieldDefinitions: Record<string, { phiFields: string[]; auditSafeFields: string[] }> = {
  // === PATIENT DATA (HIGH PHI) ===
  psychologist_patients: {
    phiFields: [
      "manual_first_name",
      "manual_last_name",
      "manual_full_name",
      "manual_preferred_name",
      "manual_date_of_birth",
      "manual_place_of_birth",
      "manual_address",
      "manual_phone",
      "manual_email",
      "manual_cpf",
      "manual_rg",
      "manual_gender",
      "manual_profession",
      "manual_pronouns",
      "synced_display_name",
      "synced_full_name",
      "synced_date_of_birth",
      "synced_phone",
      "synced_email",
      "synced_address",
      "synced_cpf",
      "synced_rg",
      "synced_gender",
      "synced_profession",
      "synced_pronouns",
      "synced_place_of_birth",
      "initial_complaint",
      "disorders",
      "known_allergies",
      "current_medications",
      "clinical_notes",
      "clinical_hypothesis",
      "therapeutic_goals",
      "treatment_plan",
      "risk_level",
      "suicide_risk_assessment",
      "discharge_reason",
      "informed_consent_document_url",
      "informed_consent_signed",
      "informed_consent_date",
      "data_sharing_consent",
      "data_sharing_consent_date",
      "attached_documents",
    ],
    auditSafeFields: [
      "id",
      "patient_id",
      "psychologist_id",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
      "deleted_by",
      "archived_at",
      "archived_by",
      "status",
      "invite_status",
      "invite_token",
      "invite_sent_via",
      "invite_sent_at",
      "invite_expires_at",
      "invite_reminder_sent_at",
      "invite_reminder_count",
      "is_minor",
      "requires_legal_guardian",
      "first_session_date",
      "last_session_date",
      "total_sessions_count",
      "default_session_price",
      "price_set_at",
      "price_set_by",
      "preferred_contact_method",
      "recovery_deadline",
      "relationship_start_date",
      "relationship_end_date",
      "retention_until",
    ],
  },

  // === CLINICAL SESSIONS ===
  clinical_session_details: {
    phiFields: [], // No direct PHI - references only
    auditSafeFields: [
      "id",
      "calendar_event_id",
      "clinical_session_id",
      "patient_id",
      "psychologist_client_id",
      "psychologist_service_id",
      "session_type_id",
      "session_number",
      "attendance_confirmed",
      "billing_status",
      "billing_attempt_count",
      "billing_last_attempt_at",
      "billing_last_error",
      "billing_next_attempt_at",
      "reminder_sent_at",
      "confirmation_sent_at",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_clinical_sessions: {
    phiFields: [], // Session metadata only (no clinical content)
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "calendar_event_id",
      "clinical_session_id",
      "session_number",
      "status",
      "created_at",
      "updated_at",
    ],
  },

  // === PATIENT SUB-ENTITIES (HIGH PHI) ===
  psychologist_patient_assessments: {
    phiFields: [
      "assessment_name",
      "assessment_result",
      "clinical_interpretation",
      "administered_by",
    ],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "assessment_date",
      "status",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_patient_guardians: {
    phiFields: [
      "full_name",
      "date_of_birth",
      "cpf",
      "rg",
      "address",
      "phone",
      "email",
      "profession",
      "gender",
    ],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "relationship_type",
      "is_primary",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_patient_emergency_contacts: {
    phiFields: ["full_name", "phone", "email", "address", "relationship"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "priority",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_patient_medical_items: {
    phiFields: [
      "item_name",
      "dosage",
      "frequency",
      "prescribed_by",
      "notes",
      "allergen_name",
      "reaction_description",
      "severity",
    ],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "item_type",
      "started_at",
      "discontinued_at",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_patient_activities: {
    phiFields: ["activity_name", "description", "patient_response", "notes"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "catalog_activity_id",
      "completed_at",
      "status",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_patient_services: {
    phiFields: [], // Service configuration only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "service_id",
      "active",
      "created_at",
      "updated_at",
    ],
  },

  // === NOTES (HIGH PHI) ===
  psychologist_notes: {
    phiFields: [
      "title",
      "content",
      "clinical_observations",
      "interventions_used",
      "patient_response",
      "homework_assigned",
      "risk_assessment",
      "treatment_progress",
    ],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "session_id",
      "note_type",
      "visibility",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_quick_notes: {
    phiFields: ["content", "tags"],
    auditSafeFields: ["id", "psychologist_id", "patient_id", "created_at", "updated_at"],
  },

  // === DOCUMENTS (HIGH PHI) ===
  generated_documents: {
    phiFields: ["document_content", "template_used", "generated_data"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "document_type",
      "status",
      "version",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_patient_guardian_documents: {
    phiFields: ["document_content", "document_type", "file_url"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "guardian_id",
      "created_at",
      "updated_at",
    ],
  },

  // === FINANCIAL (PHI - billing amounts linked to patients) ===
  psychologist_patient_charges: {
    phiFields: [], // Amount is PHI but not clinical
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "service_id",
      "amount_cents",
      "currency",
      "status",
      "due_date",
      "paid_at",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_invoices: {
    phiFields: [], // Invoice metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "patient_id",
      "total_amount_cents",
      "currency",
      "status",
      "stripe_invoice_id",
      "stripe_payment_intent_id",
      "due_date",
      "paid_at",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_financial_entries: {
    phiFields: [], // Financial metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "charge_id",
      "invoice_id",
      "entry_type",
      "amount_cents",
      "currency",
      "status",
      "created_at",
      "updated_at",
    ],
  },

  // === CALENDAR (MODERATE PHI - appointment details) ===
  calendar_events: {
    phiFields: [
      "title",
      "description",
      "location",
      "private_notes",
      "metadata", // May contain patient info
    ],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "series_id",
      "event_type",
      "status",
      "source",
      "all_day",
      "start_datetime",
      "end_datetime",
      "duration_minutes",
      "timezone",
      "color",
      "google_event_id",
      "google_sync_status",
      "google_sync_error",
      "last_synced_at",
      "remote_updated_at",
      "remote_etag",
      "sync_origin",
      "original_start_datetime",
      "original_end_datetime",
      "created_at",
      "updated_at",
    ],
  },

  calendar_event_series: {
    phiFields: ["title", "description", "location", "metadata"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "event_type",
      "rrule",
      "effective_start",
      "effective_end",
      "start_time",
      "end_time",
      "duration_minutes",
      "timezone",
      "all_day",
      "color",
      "google_event_id",
      "google_sync_status",
      "created_at",
      "updated_at",
    ],
  },

  calendar_event_series_exceptions: {
    phiFields: ["reason", "modified_fields"], // May contain PHI
    auditSafeFields: [
      "id",
      "series_id",
      "exception_type",
      "original_date",
      "new_start_datetime",
      "new_end_datetime",
      "created_at",
    ],
  },

  availability_exceptions: {
    phiFields: ["reason"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "exception_date",
      "start_time",
      "end_time",
      "is_available",
      "created_at",
    ],
  },

  busy_slots: {
    phiFields: ["reason", "metadata"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "slot_date",
      "start_time",
      "end_time",
      "slot_type",
      "created_at",
      "updated_at",
    ],
  },

  calendar_change_log: {
    phiFields: [], // Audit log metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "event_id",
      "change_type",
      "changed_fields",
      "old_values",
      "new_values",
      "correlation_id",
      "google_event_id",
      "sync_direction",
      "processed_at",
      "created_at",
    ],
  },

  calendar_holidays: {
    phiFields: [], // Public data only
    auditSafeFields: [
      "id",
      "name",
      "description",
      "date",
      "year",
      "type",
      "country",
      "state",
      "city",
      "source",
      "created_at",
      "updated_at",
    ],
  },

  // === ASSISTANTS (MODERATE PHI - contact info) ===
  assistant_invites: {
    phiFields: ["invited_email", "invited_phone"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "invited_email",
      "invited_phone",
      "invite_status",
      "invite_token",
      "expires_at",
      "invited_at",
      "accepted_at",
      "revoked_at",
      "metadata",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_assistants: {
    phiFields: ["full_name", "email", "phone", "avatar_url"],
    auditSafeFields: [
      "id",
      "psychologist_id",
      "user_id",
      "role",
      "permissions",
      "active",
      "last_active_at",
      "created_at",
      "updated_at",
    ],
  },

  // === GOOGLE SYNC (LOW PHI - sync metadata) ===
  google_calendar_connections: {
    phiFields: [], // Connection metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "google_user_id",
      "google_email",
      "connection_status",
      "last_synced_at",
      "sync_enabled",
      "created_at",
      "updated_at",
    ],
  },

  google_sync_idempotency: {
    phiFields: [], // Technical metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "operation_type",
      "operation_key",
      "result_hash",
      "created_at",
    ],
  },

  google_sync_inbound_coalesce: {
    phiFields: [], // Sync buffer only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "connection_id",
      "google_event_id",
      "operation_type",
      "payload",
      "processed",
      "locked_at",
      "locked_by",
      "created_at",
    ],
  },

  google_sync_job_dedup: {
    phiFields: [], // Technical dedup only
    auditSafeFields: ["id", "psychologist_id", "job_key", "last_run_at"],
  },

  google_sync_logs: {
    phiFields: [], // Log metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "connection_id",
      "sync_direction",
      "operation_type",
      "google_event_id",
      "status",
      "error_message",
      "duration_ms",
      "created_at",
    ],
  },

  google_sync_worker_metrics: {
    phiFields: [], // Metrics only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "worker_id",
      "jobs_processed",
      "jobs_failed",
      "avg_duration_ms",
      "last_heartbeat_at",
      "created_at",
    ],
  },

  // === PREFERENCES (LOW PHI) ===
  psychologist_preferences: {
    phiFields: [], // Configuration only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "timezone",
      "locale",
      "currency",
      "preferences",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_services: {
    phiFields: [], // Service catalog only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "service_name",
      "description",
      "default_price_cents",
      "currency",
      "active",
      "created_at",
      "updated_at",
    ],
  },

  psychologist_onboarding_state: {
    phiFields: [], // Onboarding metadata only
    auditSafeFields: [
      "id",
      "psychologist_id",
      "current_step",
      "completed_steps",
      "onboarding_completed",
      "completed_at",
      "created_at",
      "updated_at",
    ],
  },

  // === AUDIT LOGS (NO PHI - metadata only) ===
  audit_logs: {
    phiFields: [],
    auditSafeFields: [
      "id",
      "user_id",
      "user_type",
      "table_name",
      "record_id",
      "action",
      "changed_fields",
      "correlation_id",
      "user_agent",
      "ip_address",
      "created_at",
    ],
  },

  encryption_audit_log: {
    phiFields: [],
    auditSafeFields: ["id", "user_id", "operation", "key_id", "created_at"],
  },

  patient_deletion_audit_log: {
    phiFields: [],
    auditSafeFields: [
      "id",
      "patient_id",
      "psychologist_id",
      "deletion_requested_at",
      "deletion_completed_at",
      "reason",
    ],
  },

  psychologist_preferences_audit_log: {
    phiFields: [],
    auditSafeFields: ["id", "psychologist_id", "action", "changed_fields", "created_at"],
  },

  // === OBSERVABILITY (NO PHI) ===
  observability_events: {
    phiFields: [],
    auditSafeFields: [
      "id",
      "event_type",
      "severity",
      "source",
      "correlation_id",
      "payload",
      "created_at",
    ],
  },

  // === ACCOUNT MANAGEMENT (NO PHI) ===
  account_deletion_requests: {
    phiFields: [],
    auditSafeFields: [
      "id",
      "user_id",
      "requested_by",
      "reason",
      "metadata",
      "status",
      "requested_at",
      "processing_started_at",
      "processed_at",
      "approved_at",
      "cancelled_at",
      "failed_at",
      "failure_reason",
      "retention_until",
    ],
  },
}

// Process each entry
let updatedCount = 0
repositoryPlan.entries = repositoryPlan.entries.map((entry: RepositoryPlanEntry) => {
  const tableName = entry.table

  // Skip if already has phiFields (shouldn't happen)
  if (entry.phiFields || entry.auditSafeFields) {
    console.log(`⚠️  Skipping ${tableName} - already has PHI fields`)
    return entry
  }

  // Add PHI fields if we have a definition
  const phiDef = phiFieldDefinitions[tableName]
  if (phiDef) {
    entry.phiFields = phiDef.phiFields
    entry.auditSafeFields = phiDef.auditSafeFields
    console.log(`✅ Added PHI fields to ${tableName}`)
    updatedCount++
  } else {
    // Catalog/public tables - no PHI
    entry.phiFields = []
    entry.auditSafeFields = Object.keys(entry.read || {}).length > 0 ? ["id"] : []
    console.log(`⚪ Skipped ${tableName} - no PHI (catalog/public)`)
  }

  return entry
})

// Write updated repository-plan.json
writeFileSync(repositoryPlanPath, JSON.stringify(repositoryPlan, null, 2) + "\n", "utf-8")

console.log(`\n✅ Done! Updated ${updatedCount} tables with PHI field definitions`)
console.log(`📄 File: ${repositoryPlanPath}`)
