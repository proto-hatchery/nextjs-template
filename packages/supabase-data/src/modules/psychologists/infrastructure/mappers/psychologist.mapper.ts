import type { Database } from "@workspace/supabase-infra/types/database";
import type { PsychologistServiceWithReferenceDTO } from "../../domain/dto/psychologist.dto";

type ServiceReferenceJoin = {
  id: string;
  name: string;
  code: string;
  metadata: Database["public"]["Tables"]["reference_values"]["Row"]["metadata"];
};

type PsychologistServiceWithReferenceRow =
  Database["public"]["Tables"]["psychologist_services"]["Row"] & {
    reference: ServiceReferenceJoin | ServiceReferenceJoin[] | null;
  };

export function toPsychologistServiceWithReferenceDTO(
  row: PsychologistServiceWithReferenceRow,
): PsychologistServiceWithReferenceDTO {
  const resolvedReference = Array.isArray(row.reference) ? row.reference[0] : row.reference;
  const metadata =
    resolvedReference?.metadata &&
    typeof resolvedReference.metadata === "object" &&
    !Array.isArray(resolvedReference.metadata)
      ? (resolvedReference.metadata as Record<string, unknown>)
      : null;

  return {
    id: row.id,
    psychologist_id: row.psychologist_id,
    name: row.name ?? "",
    price: row.price ?? 0,
    duration_minutes: row.duration_minutes ?? 50,
    description: row.description ?? "",
    is_active: row.is_active,
    is_public: row.is_public,
    notes: row.description ?? "",
    catalog_id: row.catalog_id,
    service_id: row.service_id,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reference: resolvedReference
      ? {
          id: resolvedReference.id,
          name: resolvedReference.name,
          code: resolvedReference.code,
          description: typeof metadata?.description === "string" ? metadata.description : "",
          default_duration_minutes:
            typeof metadata?.default_duration_minutes === "number"
              ? metadata.default_duration_minutes
              : 50,
        }
      : null,
  };
}
