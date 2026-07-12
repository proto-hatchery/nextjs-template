import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ActivityReferenceDTO,
  ApproachReferenceDTO,
  CancellationPolicyReferenceDTO,
  ServiceReferenceDTO,
  SpecialtyReferenceDTO,
} from "../../domain/dto/reference-value.dto";

type ReferenceValueRow = Database["public"]["Tables"]["reference_values"]["Row"];
type ActivityRow = Database["public"]["Tables"]["catalog_clinical_activities"]["Row"];

type ServiceMetadata = {
  description?: string;
  default_duration_minutes?: number;
};

type CancellationPolicyMetadata = {
  min_notice_hours?: number;
  fee_percentage?: number;
};

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toServiceMetadata(value: unknown): ServiceMetadata {
  const metadata = asObject(value);
  if (!metadata) {
    return {};
  }

  return {
    ...(typeof metadata.description === "string" ? { description: metadata.description } : {}),
    ...(typeof metadata.default_duration_minutes === "number"
      ? { default_duration_minutes: metadata.default_duration_minutes }
      : {}),
  };
}

function toCancellationPolicyMetadata(value: unknown): CancellationPolicyMetadata {
  const metadata = asObject(value);
  if (!metadata) {
    return {};
  }

  return {
    ...(typeof metadata.min_notice_hours === "number"
      ? { min_notice_hours: metadata.min_notice_hours }
      : {}),
    ...(typeof metadata.fee_percentage === "number"
      ? { fee_percentage: metadata.fee_percentage }
      : {}),
  };
}

export function mapServiceReference(row: ReferenceValueRow): ServiceReferenceDTO {
  const metadata = toServiceMetadata(row.metadata);
  return {
    id: row.id,
    name: row.label_pt,
    code: row.value,
    description: metadata.description ?? "",
    default_duration_minutes: metadata.default_duration_minutes ?? 50,
  };
}

export function mapSpecialtyReference(row: ReferenceValueRow): SpecialtyReferenceDTO {
  return {
    id: row.id,
    name: row.label_pt,
    code: row.value,
  };
}

export function mapApproachReference(row: ReferenceValueRow): ApproachReferenceDTO {
  return {
    id: row.id,
    name: row.label_pt,
    code: row.value,
  };
}

export function mapCancellationPolicyReference(
  row: ReferenceValueRow,
): CancellationPolicyReferenceDTO {
  const metadata = toCancellationPolicyMetadata(row.metadata);
  return {
    id: row.id,
    name: row.label_pt,
    code: row.value,
    min_notice_hours: metadata.min_notice_hours ?? 24,
    fee_percentage: metadata.fee_percentage ?? 0,
  };
}

export function mapActivityReference(row: ActivityRow): ActivityReferenceDTO {
  return {
    id: row.id,
    code: row.code,
    name: row.name ?? row.code ?? "",
    description: row.description,
    active: row.active,
    pdf_path: row.pdf_path,
    activity_kind: row.activity_kind,
    clinician_notes_template: row.clinician_notes_template,
    delivery_modes: row.delivery_modes,
    duration_min: row.duration_min,
    goals: row.goals,
    image_path: row.image_path,
    materials_json: row.materials_json,
    populations: row.populations,
    risk_level: row.risk_level,
    tags: row.tags,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
