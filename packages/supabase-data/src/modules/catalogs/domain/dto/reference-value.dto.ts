export type ReferenceCategoryDTO =
  | "psychological_service_type"
  | "specialty"
  | "approach"
  | "cancellation_policy";

export interface ServiceReferenceDTO {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description: string;
  readonly default_duration_minutes: number;
}

export interface SpecialtyReferenceDTO {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface ApproachReferenceDTO {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

export interface CancellationPolicyReferenceDTO {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly min_notice_hours: number;
  readonly fee_percentage: number;
}

export interface ActivityReferenceDTO {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly active: boolean | null;
  readonly pdf_path: string | null;
  readonly activity_kind: string | null;
  readonly clinician_notes_template: string | null;
  readonly delivery_modes: readonly string[] | null;
  readonly duration_min: number | null;
  readonly goals: readonly string[] | null;
  readonly image_path: string | null;
  readonly materials_json: unknown | null;
  readonly populations: readonly string[] | null;
  readonly risk_level: string | null;
  readonly tags: readonly string[] | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface ActivitiesPaginationInputDTO {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AllCatalogsDTO {
  readonly services: readonly ServiceReferenceDTO[];
  readonly specialties: readonly SpecialtyReferenceDTO[];
  readonly approaches: readonly ApproachReferenceDTO[];
  readonly cancellationPolicies: readonly CancellationPolicyReferenceDTO[];
  readonly activities: readonly ActivityReferenceDTO[];
}
